import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import LoginForm from '../../Login/LoginForm.jsx';

function createProps(overrides = {}) {
    return {
        email: 'test@example.com',
        onEmailChange: vi.fn(),
        password: 'password123',
        onPasswordChange: vi.fn(),
        errors: {
            fieldErrors: {},
            global: []
        },
        loading: false,
        onSubmit: vi.fn((event) => event.preventDefault()),
        ...overrides
    };
}

function renderComponent(overrides = {}) {
    const props = createProps(overrides);

    return {
        ...render(<LoginForm {...props} />),
        props
    };
}

describe('LoginForm', () => {
    it('renders both input fields with their values', () => {
        renderComponent();

        expect(screen.getByLabelText(/email/i)).toHaveValue('test@example.com');
        expect(screen.getByLabelText(/password/i)).toHaveValue('password123');
    });

    it('renders the submit button', () => {
        renderComponent();

        expect(
            screen.getByRole('button', { name: /log in/i })
        ).toBeInTheDocument();
    });

    it('calls onEmailChange with the new value', () => {
        const onEmailChange = vi.fn();

        renderComponent({
            email: '',
            onEmailChange
        });

        fireEvent.change(screen.getByLabelText(/email/i), {
            target: { value: 'new@example.com' }
        });

        expect(onEmailChange).toHaveBeenCalledTimes(1);
        expect(onEmailChange).toHaveBeenCalledWith('new@example.com');
    });

    it('calls onPasswordChange with the new value', () => {
        const onPasswordChange = vi.fn();

        renderComponent({
            password: '',
            onPasswordChange
        });

        fireEvent.change(screen.getByLabelText(/password/i), {
            target: { value: 'newpassword123' }
        });

        expect(onPasswordChange).toHaveBeenCalledTimes(1);
        expect(onPasswordChange).toHaveBeenCalledWith('newpassword123');
    });

    it('calls onSubmit when the form is submitted', () => {
        const onSubmit = vi.fn((event) => event.preventDefault());

        renderComponent({ onSubmit });

        fireEvent.click(screen.getByRole('button', { name: /log in/i }));

        expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it('renders global error messages', () => {
        renderComponent({
            errors: {
                fieldErrors: {},
                global: ['Invalid email or password.']
            }
        });

        expect(
            screen.getByText(/invalid email or password/i)
        ).toBeInTheDocument();
    });

    it('renders field errors on the correct inputs', () => {
        renderComponent({
            errors: {
                fieldErrors: {
                    email: 'Email is required.',
                    password: 'Password is required.'
                },
                global: []
            }
        });

        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });

    it('shows the loading state on the submit button', () => {
        renderComponent({ loading: true });

        expect(
            screen.getByRole('button', { name: /logging in/i })
        ).toBeDisabled();
    });

    it('shows the normal submit state when not loading', () => {
        renderComponent({ loading: false });

        expect(
            screen.getByRole('button', { name: /log in/i })
        ).not.toBeDisabled();
    });
});