import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../../../utils/Auth/authStatus.js', () => ({
    default: vi.fn(() => false),
}));

vi.mock('../../utils/Helpers/getHeroImage.js', () => ({
    default: vi.fn(() => 'test-image.png'),
}));

vi.mock('../../utils/Helpers/getHeroButtons.js', () => ({
    default: vi.fn(() => [
        { label: 'Sign Up', path: '/signup', style: 'black' },
        { label: 'Login', path: '/login', style: 'white' },
    ]),
}));

vi.mock('../../Hero/HeroContent.jsx', () => ({
    default: ({ buttons, onNavigate }) => (
        <div data-testid="hero-content">
            {buttons.map((button) => (
                <button key={button.label} onClick={() => onNavigate(button.path)}>
                    {button.label}
                </button>
            ))}
        </div>
    ),
}));

vi.mock('../../Hero/HeroImage.jsx', () => ({
    default: ({ heroImage }) => <img data-testid="hero-image" src={heroImage} alt="hero" />,
}));

vi.mock('../../stylesheets/Hero/Hero.css', () => ({}));

import Hero from '../../Hero/Hero.jsx';
import * as getHeroImageModule from '../../utils/Helpers/getHeroImage.js';
import * as getHeroButtonsModule from '../../utils/Helpers/getHeroButtons.js';
import * as authStatusModule from '../../../../utils/Auth/authStatus.js';

const renderHero = (theme = 'light') =>
    render(
        <MemoryRouter>
            <Hero theme={theme} />
        </MemoryRouter>
    );

describe('Hero', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        authStatusModule.default.mockReturnValue(false);
        getHeroImageModule.default.mockReturnValue('test-image.png');
        getHeroButtonsModule.default.mockReturnValue([
            { label: 'Sign Up', path: '/signup', style: 'black' },
            { label: 'Login', path: '/login', style: 'white' },
        ]);
    });

    it('renders the hero content', () => {
        renderHero();
        expect(screen.getByTestId('hero-content')).toBeInTheDocument();
    });

    it('renders the hero image', () => {
        renderHero();
        expect(screen.getByTestId('hero-image')).toBeInTheDocument();
    });

    it('calls getHeroImage with the correct theme', () => {
        renderHero('dark');
        expect(getHeroImageModule.default).toHaveBeenCalledWith('dark');
    });

    it('calls getHeroButtons with the logged in state', () => {
        authStatusModule.default.mockReturnValue(true);
        renderHero();
        expect(getHeroButtonsModule.default).toHaveBeenCalledWith(true);
    });

    it('passes the hero image to HeroImage', () => {
        renderHero();
        expect(screen.getByTestId('hero-image')).toHaveAttribute('src', 'test-image.png');
    });
});