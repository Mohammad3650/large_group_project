import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';

import Signup from '../Signup';
import { signupUser } from '../../../utils/Auth/authService';
import { isTokenValid } from '../../../utils/Auth/authToken';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate
    };
});

vi.mock('../../../utils/Auth/authService', () => ({
    signupUser: vi.fn()
}));

vi.mock('../../../utils/Auth/authToken', () => ({
    isTokenValid: vi.fn()
}));

function renderSignup() {
    return render(
        <MemoryRouter>
            <Signup />
        </MemoryRouter>
    );
}

async function fillSignupForm(overrides = {}) {
    const values = {
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        phoneNumber: '07123456789',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        ...overrides
    };

    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
        target: { value: values.email }
    });
    fireEvent.change(screen.getByPlaceholderText('Choose a username'), {
        target: { value: values.username }
    });
    fireEvent.change(screen.getByPlaceholderText('First name'), {
        target: { value: values.firstName }
    });
    fireEvent.change(screen.getByPlaceholderText('Last name'), {
        target: { value: values.lastName }
    });
    fireEvent.change(screen.getByPlaceholderText('e.g. 07123 456 789'), {
        target: { value: values.phoneNumber }
    });
    fireEvent.change(screen.getByPlaceholderText('Create a password'), {
        target: { value: values.password }
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm password'), {
        target: { value: values.confirmPassword }
    });
}

describe('Tests for Signup', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        isTokenValid.mockResolvedValue(false);
    });

    it('renders the signup form', () => {
        renderSignup();

        expect(screen.getByText('Create your account')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
    });

    it('redirects to the dashboard when the user already has a valid token', async () => {
        isTokenValid.mockResolvedValue(true);

        renderSignup();

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
        });
    });

    it('submits valid signup data and redirects on success', async () => {
        const user = userEvent.setup();

        signupUser.mockResolvedValue({
            access: 'mock-access',
            refresh: 'mock-refresh'
        });

        renderSignup();
        await fillSignupForm();

        await user.click(screen.getByRole('button', { name: /sign up/i }));

        expect(signupUser).toHaveBeenCalledWith({
            email: 'test@example.com',
            username: 'testuser',
            firstName: 'Test',
            lastName: 'User',
            phoneNumber: '07123456789',
            password: 'Password123!',
            confirmPassword: 'Password123!'
        });

        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });

    it('shows required field errors and does not submit an empty form', async () => {
        const user = userEvent.setup();

        renderSignup();
        await user.click(screen.getByRole('button', { name: /sign up/i }));

        expect(await screen.findByText('Email is required.')).toBeInTheDocument();
        expect(screen.getByText('Username is required.')).toBeInTheDocument();
        expect(screen.getByText('First name is required.')).toBeInTheDocument();
        expect(screen.getByText('Last name is required.')).toBeInTheDocument();
        expect(screen.getByText('Phone number is required.')).toBeInTheDocument();
        expect(screen.getByText('Password is required.')).toBeInTheDocument();
        expect(screen.getByText('Please confirm your password.')).toBeInTheDocument();

        expect(signupUser).not.toHaveBeenCalled();
    });

    it('shows an error when passwords do not match', async () => {
        const user = userEvent.setup();

        renderSignup();
        await fillSignupForm({
            confirmPassword: 'Different123!'
        });

        await user.click(screen.getByRole('button', { name: /sign up/i }));

        expect(await screen.findByText('Passwords do not match.')).toBeInTheDocument();

        expect(signupUser).not.toHaveBeenCalled();
    });

    it('shows API global errors when signup fails', async () => {
        const user = userEvent.setup();
        signupUser.mockRejectedValue(new Error('API error'));

        renderSignup();
        await fillSignupForm();

        await user.click(screen.getByRole('button', { name: /sign up/i }));

        expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument();
    });

    it('renders backend field errors under the matching input', async () => {
        const user = userEvent.setup();

        const error = {
            response: {
                data: {
                    email: ['Email is already in use.']
                }
            },
            isAxiosError: true
        };

        signupUser.mockRejectedValue(error);

        renderSignup();
        await fillSignupForm();

        await user.click(screen.getByRole('button', { name: /sign up/i }));

        expect(await screen.findByText('Email is already in use.')).toBeInTheDocument();
    });

    it('does not submit again while a signup request is in progress', async () => {
        signupUser.mockImplementation(() => new Promise(() => {}));

        renderSignup();
        await fillSignupForm();

        const form = screen.getByRole('button', { name: /sign up/i }).closest('form');

        fireEvent.submit(form);
        fireEvent.submit(form);

        expect(signupUser).toHaveBeenCalledTimes(1);
    });
});
