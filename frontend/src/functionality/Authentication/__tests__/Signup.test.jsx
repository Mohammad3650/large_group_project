import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';

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

    await user.type(
        screen.getByPlaceholderText('you@example.com'),
        values.email
    );
    await user.type(
        screen.getByPlaceholderText('Choose a username'),
        values.username
    );
    await user.type(
        screen.getByPlaceholderText('First name'),
        values.firstName
    );
    await user.type(screen.getByPlaceholderText('Last name'), values.lastName);
    await user.type(
        screen.getByPlaceholderText('e.g. 07123 456 789'),
        values.phoneNumber
    );
    await user.type(
        screen.getByPlaceholderText('Create a password'),
        values.password
    );
    await user.type(
        screen.getByPlaceholderText('Confirm password'),
        values.confirmPassword
    );
}

describe('Signup page', () => {
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
        const user = userEvent.setup();

        publicApi.post.mockImplementation(() => new Promise(() => {}));

        renderSignup();
        await fillSignupForm(user);

        const button = screen.getByRole('button', { name: /sign up/i });

        await user.click(button);
        await user.click(button);

        expect(publicApi.post).toHaveBeenCalledTimes(1);
    });
});
