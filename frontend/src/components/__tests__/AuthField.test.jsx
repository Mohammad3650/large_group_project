import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import AuthField from '../AuthField';

describe('AuthField', () => {
    it('renders the label and input with the provided props', () => {
        render(
            <AuthField
                name="email"
                label="Email"
                type="email"
                placeholder="you@example.com"
                value=""
                onChange={vi.fn()}
            />
        );

        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText('you@example.com')
        ).toBeInTheDocument();
        expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');
    });

    it('calls onChange with the new value when the user types', async () => {
        const user = userEvent.setup();
        const handleChange = vi.fn();

        render(
            <AuthField
                name="username"
                label="Username"
                placeholder="Choose a username"
                value=""
                onChange={handleChange}
            />
        );

        await user.type(
            screen.getByPlaceholderText('Choose a username'),
            'testuser'
        );

        expect(handleChange).toHaveBeenCalled();
    });

    it('shows the error message and invalid class when an error is provided', () => {
        render(
            <AuthField
                name="password"
                label="Password"
                type="password"
                placeholder="Enter password"
                value=""
                onChange={vi.fn()}
                error="Password is required."
            />
        );

        expect(screen.getByText('Password is required.')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter password')).toHaveClass(
            'is-invalid'
        );
    });

    it('does not show an error message when no error is provided', () => {
        render(
            <AuthField
                name="firstName"
                label="First name"
                placeholder="First name"
                value=""
                onChange={vi.fn()}
            />
        );

        expect(screen.queryByText(/required/i)).not.toBeInTheDocument();
        expect(screen.getByPlaceholderText('First name')).not.toHaveClass(
            'is-invalid'
        );
    });
});
