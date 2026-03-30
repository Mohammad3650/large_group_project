import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import Signup from '../Signup';
import { isTokenValid } from '../../../utils/authToken';
import { publicApi } from '../../../api';
import { saveTokens } from '../../../utils/authStorage';
import { formatApiError } from '../../../utils/errors';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate
    };
});

vi.mock('../../../utils/authToken', () => ({
    isTokenValid: vi.fn()
}));

vi.mock('../../../api', () => ({
    publicApi: {
        post: vi.fn()
    }
}));

vi.mock('../../../utils/authStorage', () => ({
    saveTokens: vi.fn()
}));

vi.mock('../../../utils/errors', () => ({
    formatApiError: vi.fn()
}));

function renderSignup() {
    return render(
        <MemoryRouter>
            <Signup />
        </MemoryRouter>
    );
}

async function fillSignupForm(user, overrides = {}) {
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

        formatApiError.mockReturnValue({
            fieldErrors: {},
            global: ['Something went wrong.']
        });
    });

    it('renders the signup form', () => {
        renderSignup();

        expect(screen.getByText('Create your account')).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText('you@example.com')
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: /sign up/i })
        ).toBeInTheDocument();
    });

    it('redirects to the dashboard when the user already has a valid token', async () => {
        isTokenValid.mockResolvedValue(true);

        renderSignup();

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
        });
    });

    it('submits valid signup data, stores tokens, and redirects on success', async () => {
        const user = userEvent.setup();

        publicApi.post.mockResolvedValue({
            data: {
                access: 'mock-access',
                refresh: 'mock-refresh'
            }
        });

        renderSignup();
        await fillSignupForm(user);

        await user.click(screen.getByRole('button', { name: /sign up/i }));

        expect(publicApi.post).toHaveBeenCalledWith('/auth/signup/', {
            email: 'test@example.com',
            username: 'testuser',
            first_name: 'Test',
            last_name: 'User',
            phone_number: '07123456789',
            password: 'Password123!'
        });

        expect(saveTokens).toHaveBeenCalledWith('mock-access', 'mock-refresh');
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });

    it('shows required field errors and does not submit an empty form', async () => {
        const user = userEvent.setup();

        renderSignup();
        await user.click(screen.getByRole('button', { name: /sign up/i }));

        expect(
            await screen.findByText('Email is required.')
        ).toBeInTheDocument();
        expect(screen.getByText('Username is required.')).toBeInTheDocument();
        expect(screen.getByText('First name is required.')).toBeInTheDocument();
        expect(screen.getByText('Last name is required.')).toBeInTheDocument();
        expect(
            screen.getByText('Phone number is required.')
        ).toBeInTheDocument();
        expect(screen.getByText('Password is required.')).toBeInTheDocument();
        expect(
            screen.getByText('Please confirm your password.')
        ).toBeInTheDocument();

        expect(publicApi.post).not.toHaveBeenCalled();
    });

    it('shows an error when passwords do not match', async () => {
        const user = userEvent.setup();

        renderSignup();
        await fillSignupForm(user, {
            confirmPassword: 'Different123!'
        });

        await user.click(screen.getByRole('button', { name: /sign up/i }));

        expect(
            await screen.findByText('Passwords do not match.')
        ).toBeInTheDocument();

        expect(publicApi.post).not.toHaveBeenCalled();
    });

    it('shows API global errors when signup fails', async () => {
        const user = userEvent.setup();

        publicApi.post.mockRejectedValue(new Error('API error'));
        formatApiError.mockReturnValue({
            fieldErrors: {},
            global: ['Signup failed']
        });

        renderSignup();
        await fillSignupForm(user);

        await user.click(screen.getByRole('button', { name: /sign up/i }));

        expect(formatApiError).toHaveBeenCalled();
        expect(await screen.findByText('Signup failed')).toBeInTheDocument();
    });

    it('renders backend field errors under the matching input', async () => {
        const user = userEvent.setup();

        publicApi.post.mockRejectedValue(new Error('API error'));
        formatApiError.mockReturnValue({
            fieldErrors: {
                email: ['Email is already in use.']
            },
            global: []
        });

        renderSignup();
        await fillSignupForm(user);

        await user.click(screen.getByRole('button', { name: /sign up/i }));

        expect(
            await screen.findByText('Email is already in use.')
        ).toBeInTheDocument();
    });

    it('does not submit again while a signup request is in progress', async () => {
        publicApi.post.mockImplementation(() => new Promise(() => {}));

        renderSignup();
        await fillSignupForm();

        const form = screen.getByRole('button', { name: /sign up/i }).closest('form');

        fireEvent.submit(form);
        fireEvent.submit(form);

        expect(publicApi.post).toHaveBeenCalledTimes(1);
    });
});
