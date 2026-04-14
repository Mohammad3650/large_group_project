import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import SignupForm from '../../Signup/SignupForm.jsx';

function createFieldProps(values = {}, handlers = {}) {
    return function getFieldProps(name) {
        return {
            value: values[name] ?? '',
            onChange: handlers[name] ?? vi.fn()
        };
    };
}

function createProps(overrides = {}) {
    const handlers = {
        email: vi.fn(),
        username: vi.fn(),
        firstName: vi.fn(),
        lastName: vi.fn(),
        phoneNumber: vi.fn(),
        password: vi.fn(),
        confirmPassword: vi.fn()
    };

    return {
        getFieldProps: createFieldProps(
            {
                email: 'test@example.com',
                username: 'testuser',
                firstName: 'Test',
                lastName: 'User',
                phoneNumber: '07123456789',
                password: 'password123',
                confirmPassword: 'password123'
            },
            handlers
        ),
        errors: {
            fieldErrors: {},
            global: []
        },
        loading: false,
        onSubmit: vi.fn((event) => event.preventDefault()),
        fieldHandlers: handlers,
        ...overrides
    };
}

function renderComponent(overrides = {}) {
    const props = createProps(overrides);

    return {
        ...render(
            <SignupForm
                getFieldProps={props.getFieldProps}
                errors={props.errors}
                loading={props.loading}
                onSubmit={props.onSubmit}
            />
        ),
        props
    };
}

describe('SignupForm', () => {
    it('renders all signup fields with their values', () => {
        renderComponent();

        expect(screen.getByLabelText(/email/i)).toHaveValue('test@example.com');
        expect(screen.getByLabelText(/username/i)).toHaveValue('testuser');
        expect(screen.getByLabelText(/first name/i)).toHaveValue('Test');
        expect(screen.getByLabelText(/last name/i)).toHaveValue('User');
        expect(screen.getByLabelText(/phone number/i)).toHaveValue('07123456789');
        expect(screen.getByLabelText(/^password$/i)).toHaveValue('password123');
        expect(screen.getByLabelText(/confirm password/i)).toHaveValue('password123');
    });

    it('renders the submit button', () => {
        renderComponent();

        expect(
            screen.getByRole('button', { name: /sign up/i })
        ).toBeInTheDocument();
    });

    it('calls the email field onChange handler with the new value', () => {
        const emailOnChange = vi.fn();

        renderComponent({
            getFieldProps: createFieldProps(
                {
                    email: ''
                },
                {
                    email: emailOnChange
                }
            )
        });

        fireEvent.change(screen.getByLabelText(/email/i), {
            target: { value: 'new@example.com' }
        });

        expect(emailOnChange).toHaveBeenCalledTimes(1);
        expect(emailOnChange).toHaveBeenCalledWith('new@example.com');
    });

    it('calls the confirm password field onChange handler with the new value', () => {
        const confirmPasswordOnChange = vi.fn();

        renderComponent({
            getFieldProps: createFieldProps(
                {
                    confirmPassword: ''
                },
                {
                    confirmPassword: confirmPasswordOnChange
                }
            )
        });

        fireEvent.change(screen.getByLabelText(/confirm password/i), {
            target: { value: 'password456' }
        });

        expect(confirmPasswordOnChange).toHaveBeenCalledTimes(1);
        expect(confirmPasswordOnChange).toHaveBeenCalledWith('password456');
    });

    it('calls onSubmit when the form is submitted', () => {
        const onSubmit = vi.fn((event) => event.preventDefault());

        renderComponent({ onSubmit });

        fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

        expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it('renders global error messages', () => {
        renderComponent({
            errors: {
                fieldErrors: {},
                global: ['Signup failed.']
            }
        });

        expect(screen.getByText(/signup failed/i)).toBeInTheDocument();
    });

    it('renders field errors on the correct inputs', () => {
        renderComponent({
            errors: {
                fieldErrors: {
                    email: 'Email is required.',
                    username: 'Username is required.',
                    confirmPassword: 'Passwords must match.'
                },
                global: []
            }
        });

        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/username is required/i)).toBeInTheDocument();
        expect(screen.getByText(/passwords must match/i)).toBeInTheDocument();
    });

    it('shows the loading state on the submit button', () => {
        renderComponent({ loading: true });

        expect(
            screen.getByRole('button', { name: /signing up/i })
        ).toBeDisabled();
    });

    it('shows the normal submit state when not loading', () => {
        renderComponent({ loading: false });

        expect(
            screen.getByRole('button', { name: /sign up/i })
        ).not.toBeDisabled();
    });
});