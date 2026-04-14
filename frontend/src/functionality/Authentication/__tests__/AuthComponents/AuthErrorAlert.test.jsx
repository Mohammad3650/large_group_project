import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import AuthErrorAlert from '../../AuthComponents/AuthErrorAlert';

describe('AuthErrorAlert', () => {
    it('renders nothing when messages is undefined', () => {
        const { container } = render(<AuthErrorAlert />);

        expect(container.firstChild).toBeNull();
    });

    it('renders nothing when messages is an empty array', () => {
        const { container } = render(<AuthErrorAlert messages={[]} />);

        expect(container.firstChild).toBeNull();
    });

    it('renders a single error message', () => {
        render(<AuthErrorAlert messages={['Invalid email or password.']} />);

        const alert = screen.getByRole('alert');

        expect(alert).toBeInTheDocument();
        expect(screen.getByText('Invalid email or password.')).toBeInTheDocument();
    });

    it('renders multiple error messages', () => {
        render(
            <AuthErrorAlert
                messages={[
                    'Email is required.',
                    'Password must be at least 8 characters.'
                ]}
            />
        );

        const alert = screen.getByRole('alert');

        expect(alert).toBeInTheDocument();
        expect(screen.getByText('Email is required.')).toBeInTheDocument();
        expect(
            screen.getByText('Password must be at least 8 characters.')
        ).toBeInTheDocument();
    });
});