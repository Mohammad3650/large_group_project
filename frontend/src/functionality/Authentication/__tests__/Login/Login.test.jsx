import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom/vitest';
import Login from '../../Login/Login.jsx';
import useAuthRedirect from '../../utils/Hooks/useAuthRedirect.js';
import useLoginForm from '../../utils/Hooks/useLoginForm.js';

vi.mock('../../utils/Hooks/useAuthRedirect.js', () => ({
    default: vi.fn()
}));

vi.mock('../../utils/Hooks/useLoginForm.js', () => ({
    default: vi.fn()
}));

function createHookState(overrides = {}) {
    return {
        email: 'test@example.com',
        setEmail: vi.fn(),
        password: 'password123',
        setPassword: vi.fn(),
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
            <Login />
        </MemoryRouter>
    );
}

describe('Login', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('calls the auth redirect hook when rendered', () => {
        useLoginForm.mockReturnValue(createHookState());

        renderComponent();

        expect(useAuthRedirect).toHaveBeenCalledTimes(1);
    });

    it('renders the login page content', () => {
        useLoginForm.mockReturnValue(createHookState());

        renderComponent();

        expect(
            screen.getByRole('heading', { name: /welcome back/i })
        ).toBeInTheDocument();
        expect(
            screen.getByText(/log in to continue to studysync/i)
        ).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toHaveValue('test@example.com');
        expect(screen.getByLabelText(/password/i)).toHaveValue('password123');
        expect(
            screen.getByRole('button', { name: /log in/i })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('link', { name: /sign up/i })
        ).toBeInTheDocument();
    });

    it('passes email changes to the hook setter', () => {
        const setEmail = vi.fn();

        useLoginForm.mockReturnValue(
            createHookState({
                email: '',
                setEmail
            })
        );

        renderComponent();

        fireEvent.change(screen.getByLabelText(/email/i), {
            target: { value: 'new@example.com' }
        });

        expect(setEmail).toHaveBeenCalledTimes(1);
        expect(setEmail).toHaveBeenCalledWith('new@example.com');
    });

    it('passes password changes to the hook setter', () => {
        const setPassword = vi.fn();

        useLoginForm.mockReturnValue(
            createHookState({
                password: '',
                setPassword
            })
        );

        renderComponent();

        fireEvent.change(screen.getByLabelText(/password/i), {
            target: { value: 'newpassword123' }
        });

        expect(setPassword).toHaveBeenCalledTimes(1);
        expect(setPassword).toHaveBeenCalledWith('newpassword123');
    });

    it('submits the form using the hook submit handler', () => {
        const handleSubmit = vi.fn((event) => event.preventDefault());

        useLoginForm.mockReturnValue(
            createHookState({
                handleSubmit
            })
        );

        renderComponent();

        fireEvent.click(screen.getByRole('button', { name: /log in/i }));

        expect(handleSubmit).toHaveBeenCalledTimes(1);
    });

    it('renders field validation errors from hook state', () => {
        useLoginForm.mockReturnValue(
            createHookState({
                errors: {
                    fieldErrors: {
                        email: 'Email is required.',
                        password: 'Password is required.'
                    },
                    global: []
                }
            })
        );

        renderComponent();

        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });

    it('renders global errors from hook state', () => {
        useLoginForm.mockReturnValue(
            createHookState({
                errors: {
                    fieldErrors: {},
                    global: ['Invalid email or password.']
                }
            })
        );

        renderComponent();

        expect(
            screen.getByText(/invalid email or password/i)
        ).toBeInTheDocument();
    });

    it('shows the loading state from hook state', () => {
        useLoginForm.mockReturnValue(
            createHookState({
                loading: true
            })
        );

        renderComponent();

        expect(
            screen.getByRole('button', { name: /logging in/i })
        ).toBeDisabled();
    });
});