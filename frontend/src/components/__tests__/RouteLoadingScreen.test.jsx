import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import RouteLoadingScreen from '../RouteLoadingScreen.jsx';

describe('RouteLoadingScreen', () => {
    it('renders the provided loading message', () => {
        render(<RouteLoadingScreen message="Checking authentication..." />);

        expect(
            screen.getByText('Checking authentication...')
        ).toBeInTheDocument();
    });

    it('renders a spinner with status role', () => {
        render(<RouteLoadingScreen message="Loading route..." />);

        expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('applies the expected layout and spinner classes', () => {
        const { container } = render(
            <RouteLoadingScreen message="Loading route..." />
        );

        const outerWrapper = container.firstChild;
        const spinner = screen.getByRole('status');

        expect(outerWrapper).toHaveClass(
            'd-flex',
            'justify-content-center',
            'align-items-center',
            'min-vh-100'
        );

        expect(spinner).toHaveClass(
            'spinner-border',
            'text-dark',
            'mb-3'
        );
    });
});