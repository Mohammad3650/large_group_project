import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import AuthField from '../AuthField';

const renderAuthField = (props = {}) => {
    const defaultProps = {
        name: 'email',
        label: 'Email',
        type: 'email',
        placeholder: 'you@example.com',
        value: '',
        onChange: vi.fn(),
    };

    return render(<AuthField {...defaultProps} {...props} />);
};

describe('Tests for AuthField', () => {
    it('renders the label and input with the provided props', () => {
        renderAuthField();

        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText('you@example.com')
        ).toBeInTheDocument();
        expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');
    });

    it('calls onChange with the new value when the user types', async () => {
        const user = userEvent.setup();
        const handleChange = vi.fn();

        renderAuthField({
            name: 'username',
            label: 'Username',
            type: 'text',
            placeholder: 'Choose a username',
            onChange: handleChange,
        });

        await user.type(
            screen.getByPlaceholderText('Choose a username'),
            'testuser'
        );

        expect(handleChange).toHaveBeenCalled();
    });

    it('shows the error message and invalid class when an error is provided', () => {
        renderAuthField({
            name: 'password',
            label: 'Password',
            type: 'password',
            placeholder: 'Enter password',
            error: 'Password is required.',
        });

        expect(screen.getByText('Password is required.')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter password')).toHaveClass(
            'is-invalid'
        );
    });

    it('does not show an error message when no error is provided', () => {
         renderAuthField({
            name: 'firstName',
            label: 'First name',
            type: 'text',
            placeholder: 'First name',
            error: undefined,
        });

        expect(screen.queryByText(/required/i)).not.toBeInTheDocument();
        expect(screen.getByPlaceholderText('First name')).not.toHaveClass(
            'is-invalid'
        );
    });

    it('handles the exact error-state partition consistently: error present vs error absent', () => {
        const { rerender } = renderAuthField({
            name: 'password',
            label: 'Password',
            type: 'password',
            placeholder: 'Enter password',
            error: 'Password is required.',
        });

        expect(screen.getByText('Password is required.')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter password')).toHaveClass(
            'is-invalid'
        );

        rerender(
            <AuthField
                name="password"
                label="Password"
                type="password"
                placeholder="Enter password"
                value=""
                onChange={vi.fn()}
            />
        );

        expect(screen.queryByText('Password is required.')).not.toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter password')).not.toHaveClass(
            'is-invalid'
        );
    });
});
