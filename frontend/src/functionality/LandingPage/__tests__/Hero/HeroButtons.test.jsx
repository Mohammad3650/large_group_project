import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HeroButtons from '../../Hero/HeroButtons.jsx';

vi.mock('../../stylesheets/Hero/HeroButtons.css', () => ({}));

const mockNavigate = vi.fn();

const buttons = [
    { label: 'Sign Up', path: '/signup', style: 'black' },
    { label: 'Login', path: '/login', style: 'white' },
];

describe('HeroButtons', () => {
    it('renders all buttons', () => {
        render(<HeroButtons buttons={buttons} onNavigate={mockNavigate} />);
        expect(screen.getByText('Sign Up')).toBeInTheDocument();
        expect(screen.getByText('Login')).toBeInTheDocument();
    });

    it('applies the correct style class to each button', () => {
        render(<HeroButtons buttons={buttons} onNavigate={mockNavigate} />);
        expect(screen.getByText('Sign Up').closest('button')).toHaveClass('black');
        expect(screen.getByText('Login').closest('button')).toHaveClass('white');
    });

    it('calls onNavigate with the correct path when a button is clicked', () => {
        render(<HeroButtons buttons={buttons} onNavigate={mockNavigate} />);
        fireEvent.click(screen.getByText('Sign Up'));
        expect(mockNavigate).toHaveBeenCalledWith('/signup');
    });

    it('calls onNavigate with the correct path when Login is clicked', () => {
        render(<HeroButtons buttons={buttons} onNavigate={mockNavigate} />);
        fireEvent.click(screen.getByText('Login'));
        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
});