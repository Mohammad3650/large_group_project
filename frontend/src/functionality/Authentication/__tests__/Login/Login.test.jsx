import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import Login from '../Login';
import { loginUser } from '../../../utils/Auth/authService';
import { isTokenValid } from '../../../utils/Auth/authToken';

vi.mock('../../../utils/Auth/authService', () => ({
    loginUser: vi.fn()
}));

vi.mock('../../../utils/Auth/authToken', () => ({
    isTokenValid: vi.fn()
}));

function renderLoginWithRoutes() {
    return render(
        <MemoryRouter initialEntries={['/login']}>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<h2>Dashboard Page</h2>} />
            </Routes>
        </MemoryRouter>
    );
}

async function fillLoginForm(user, overrides = {}) {
    const values = {
        email: 'test@gmail.com',
        password: 'password123',
        ...overrides
    };

    await user.type(screen.getByPlaceholderText('you@example.com'), values.email);
    await user.type(screen.getByPlaceholderText('Enter your password...'), values.password);
}

describe('Tests for Login', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        isTokenValid.mockResolvedValue(false);
    });

    it('renders the login form fields and submit button', () => {
        renderLoginWithRoutes();

        expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter your password...')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
    });

    it('redirects authenticated users to the dashboard', async () => {
        isTokenValid.mockResolvedValue(true);

        renderLoginWithRoutes();

        await waitFor(() => {
            expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
        });
    });

    it('submits login credentials and redirects on success', async () => {
        const user = userEvent.setup();
        loginUser.mockResolvedValue({
            access: 'A',
            refresh: 'R'
        });

        renderLoginWithRoutes();
        await fillLoginForm(user);

        await user.click(screen.getByRole('button', { name: /log in/i }));

        await waitFor(() => {
            expect(loginUser).toHaveBeenCalledWith('test@gmail.com', 'password123');
        });

        expect(await screen.findByText('Dashboard Page')).toBeInTheDocument();
    });

    it('shows validation errors and does not submit when fields are empty', async () => {
        const user = userEvent.setup();

        renderLoginWithRoutes();

        await user.click(screen.getByRole('button', { name: /log in/i }));

        expect(await screen.findByText('Email is required.')).toBeInTheDocument();
        expect(screen.getByText('Password is required.')).toBeInTheDocument();
        expect(loginUser).not.toHaveBeenCalled();
    });

    it('shows a global error message when login fails', async () => {
        const user = userEvent.setup();
        loginUser.mockRejectedValue(new Error('login failed'));

        renderLoginWithRoutes();
        await fillLoginForm(user);

        await user.click(screen.getByRole('button', { name: /log in/i }));

        expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument();
    });

    it('does not submit the form again while the request is loading', async () => {
        const user = userEvent.setup();
        loginUser.mockImplementation(() => new Promise(() => {}));

        renderLoginWithRoutes();
        await fillLoginForm(user);

        const form = screen.getByRole('button', { name: /log in/i }).closest('form');

        fireEvent.submit(form);
        fireEvent.submit(form);

        expect(loginUser).toHaveBeenCalledTimes(1);
    });
});
