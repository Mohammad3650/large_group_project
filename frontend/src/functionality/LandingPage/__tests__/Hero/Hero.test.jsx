import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../../Authentication/utils/authStatus.js', () => ({
    default: vi.fn(() => false),
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
    default: () => <img data-testid="hero-image" alt="StudySync hero" />,
}));

vi.mock('../../stylesheets/Hero/Hero.css', () => ({}));

import Hero from '../../Hero/Hero.jsx';
import * as getHeroButtonsModule from '../../utils/Helpers/getHeroButtons.js';
import * as authStatusModule from '../../../Authentication/utils/authStatus.js';

const renderHero = () =>
    render(
        <MemoryRouter>
            <Hero />
        </MemoryRouter>
    );

describe('Hero', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        authStatusModule.default.mockReturnValue(false);
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

    it('calls getHeroButtons with the logged in state', () => {
        authStatusModule.default.mockReturnValue(true);
        renderHero();
        expect(getHeroButtonsModule.default).toHaveBeenCalledWith(true);
    });
});