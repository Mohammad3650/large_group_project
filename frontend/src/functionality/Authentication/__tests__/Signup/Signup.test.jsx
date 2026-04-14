import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom/vitest';
import Signup from '../../Signup/Signup.jsx';
import useAuthRedirect from '../../utils/Hooks/useAuthRedirect.js';
import useSignupForm from '../../utils/Hooks/useSignupForm.js';

vi.mock('../../utils/Hooks/useAuthRedirect.js', () => ({
    default: vi.fn()
}));

vi.mock('../../utils/Hooks/useSignupForm.js', () => ({
    default: vi.fn()
}));

function createHookState(overrides = {}) {
    return {
        getFieldProps: vi.fn((name) => {
            const values = {
                email: 'test@example.com',
                username: 'testuser',
                firstName: 'Test',
                lastName: 'User',
                phoneNumber: '07123456789',
                password: 'password123',
                confirmPassword: 'password123'
            };

            return {
                value: values[name] ?? '',
                onChange: vi.fn()
            };
        }),
        errors: {
            fieldErrors: {},
            global: []
        },
        loading: false,
        handleSubmit: vi.fn((event) => event.preventDefault()),
        ...overrides
    };
}

function renderComponent() {
    return render(
        <MemoryRouter>
            <Signup />
        </MemoryRouter>
    );
}

describe('Signup', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('calls the auth redirect hook when rendered', () => {
        useSignupForm.mockReturnValue(createHookState());

        renderComponent();

        expect(useAuthRedirect).toHaveBeenCalledTimes(1);
    });

    it('renders the signup page content', () => {
        useSignupForm.mockReturnValue(createHookState());

        renderComponent();

        expect(
            screen.getByRole('heading', { name: /create your account/i })
        ).toBeInTheDocument();
        expect(
            screen.getByText(/sign up to get started with studysync/i)
        ).toBeInTheDocument();

        expect(screen.getByLabelText(/email/i)).toHaveValue('test@example.com');
        expect(screen.getByLabelText(/username/i)).toHaveValue('testuser');
        expect(screen.getByLabelText(/first name/i)).toHaveValue('Test');
        expect(screen.getByLabelText(/last name/i)).toHaveValue('User');
        expect(screen.getByLabelText(/phone number/i)).toHaveValue('07123456789');
        expect(screen.getByLabelText(/^password$/i)).toHaveValue('password123');
        expect(screen.getByLabelText(/confirm password/i)).toHaveValue('password123');

        expect(
            screen.getByRole('button', { name: /sign up/i })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('link', { name: /log in/i })
        ).toBeInTheDocument();
    });

    it('passes field changes through the getFieldProps onChange handler', () => {
        const emailOnChange = vi.fn();

        const getFieldProps = vi.fn((name) => {
            if (name === 'email') {
                return {
                    value: '',
                    onChange: emailOnChange
                };
            }

            return {
                value: '',
                onChange: vi.fn()
            };
        });

        useSignupForm.mockReturnValue(
            createHookState({
                getFieldProps
            })
        );

        renderComponent();

        fireEvent.change(screen.getByLabelText(/email/i), {
            target: { value: 'new@example.com' }
        });

        expect(emailOnChange).toHaveBeenCalledTimes(1);
        expect(emailOnChange).toHaveBeenCalledWith('new@example.com');
    });

    it('submits the form using the hook submit handler', () => {
        const handleSubmit = vi.fn((event) => event.preventDefault());

        useSignupForm.mockReturnValue(
            createHookState({
                handleSubmit
            })
        );

        renderComponent();

        fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

        expect(handleSubmit).toHaveBeenCalledTimes(1);
    });

    it('renders field validation errors from hook state', () => {
        useSignupForm.mockReturnValue(
            createHookState({
                errors: {
                    fieldErrors: {
                        email: 'Email is required.',
                        password: 'Password is required.',
                        confirmPassword: 'Passwords must match.'
                    },
                    global: []
                }
            })
        );

        renderComponent();

        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
        expect(screen.getByText(/passwords must match/i)).toBeInTheDocument();
    });

    it('renders global errors from hook state', () => {
        useSignupForm.mockReturnValue(
            createHookState({
                errors: {
                    fieldErrors: {},
                    global: ['Signup failed.']
                }
            })
        );

        renderComponent();

        expect(screen.getByText(/signup failed/i)).toBeInTheDocument();
    });

    it('shows the loading state from hook state', () => {
        useSignupForm.mockReturnValue(
            createHookState({
                loading: true
            })
        );

        renderComponent();

        expect(
            screen.getByRole('button', { name: /signing up/i })
        ).toBeDisabled();
    });
});