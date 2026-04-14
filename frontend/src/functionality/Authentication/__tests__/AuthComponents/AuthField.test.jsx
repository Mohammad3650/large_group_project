import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import '@testing-library/jest-dom/vitest';
import AuthField from '../../AuthComponents/AuthField';

function renderAuthField(props = {}) {
    const defaultProps = {
        name: 'email',
        label: 'Email',
        type: 'email',
        placeholder: 'you@example.com',
        value: '',
        onChange: vi.fn()
    };

    return render(<AuthField {...defaultProps} {...props} />);
}

function ControlledAuthField(props) {
    const [value, setValue] = useState(props.value ?? '');

    function handleChange(nextValue) {
        setValue(nextValue);
        props.onChange(nextValue);
    }

    return (
        <AuthField
            {...props}
            value={value}
            onChange={handleChange}
        />
    );
}

describe('AuthField', () => {
    it('renders the label and input with the provided props', () => {
        renderAuthField();

        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
        expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');
    });

    it('calls onChange with the new value when the user types', async () => {
        const user = userEvent.setup();
        const handleChange = vi.fn();

        render(
            <ControlledAuthField
                name="username"
                label="Username"
                type="text"
                placeholder="Choose a username"
                value=""
                onChange={handleChange}
            />
        );

        const input = screen.getByPlaceholderText('Choose a username');

        await user.type(input, 'testuser');

        expect(handleChange).toHaveBeenCalled();
        expect(handleChange).toHaveBeenLastCalledWith('testuser');
        expect(input).toHaveValue('testuser');
    });

    it('shows the error message and invalid class when an error is provided', () => {
        renderAuthField({
            name: 'password',
            label: 'Password',
            type: 'password',
            placeholder: 'Enter password',
            error: 'Password is required.'
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
            error: undefined
        });

        expect(screen.queryByText(/required/i)).not.toBeInTheDocument();
        expect(screen.getByPlaceholderText('First name')).not.toHaveClass(
            'is-invalid'
        );
    });

    it('removes the invalid state when the error is cleared', () => {
        const { rerender } = renderAuthField({
            name: 'password',
            label: 'Password',
            type: 'password',
            placeholder: 'Enter password',
            error: 'Password is required.'
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

        expect(
            screen.queryByText('Password is required.')
        ).not.toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter password')).not.toHaveClass(
            'is-invalid'
        );
    });
});