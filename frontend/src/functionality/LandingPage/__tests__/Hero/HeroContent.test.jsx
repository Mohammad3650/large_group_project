import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HeroContent from '../../Hero/HeroContent.jsx';

vi.mock('../../Hero/HeroButtons.jsx', () => ({
    default: ({ buttons, onNavigate }) => (
        <div data-testid="hero-buttons">
            {buttons.map((button) => (
                <button key={button.label} onClick={() => onNavigate(button.path)}>
                    {button.label}
                </button>
            ))}
        </div>
    ),
}));

vi.mock('../../stylesheets/Hero/HeroContent.css', () => ({}));

const mockNavigate = vi.fn();
const buttons = [
    { label: 'Sign Up', path: '/signup', style: 'black' },
    { label: 'Login', path: '/login', style: 'white' },
];

describe('HeroContent', () => {
    it('renders the top hero text', () => {
        render(<HeroContent buttons={buttons} onNavigate={mockNavigate} />);
        expect(screen.getByText('Plan your study.')).toBeInTheDocument();
    });

    it('renders the bottom hero text', () => {
        render(<HeroContent buttons={buttons} onNavigate={mockNavigate} />);
        expect(screen.getByText('Live your life.')).toBeInTheDocument();
    });

    it('renders the hero buttons', () => {
        render(<HeroContent buttons={buttons} onNavigate={mockNavigate} />);
        expect(screen.getByTestId('hero-buttons')).toBeInTheDocument();
    });

    it('passes onNavigate correctly to HeroButtons', () => {
        render(<HeroContent buttons={buttons} onNavigate={mockNavigate} />);
        fireEvent.click(screen.getByText('Sign Up'));
        expect(mockNavigate).toHaveBeenCalledWith('/signup');
    });
});