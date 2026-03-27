import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute.jsx';
import { isTokenValid } from '../../utils/authToken.js';

/**
 * Mock the authToken utility to control authentication behaviour in tests.
 */
vi.mock('../../utils/authToken.js', () => ({
    isTokenValid: vi.fn()
}));

/**
 * Test for ProtectedRoute component
 * Ensures users are either allowed access or redirected to Login page based on token validity
 */

describe('ProtectedRoute', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    function renderProtectedRoute() {
        return render(
            <MemoryRouter initialEntries={['/dashboard']}>
                <Routes>
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <h1>Dashboard Page</h1>
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/login" element={<h1>Login Page</h1>} />
                </Routes>
            </MemoryRouter>
        );
    }

    it('renders page when token is valid', async () => {
        isTokenValid.mockResolvedValue(true);

        renderProtectedRoute();

        expect(await screen.findByText('Dashboard Page')).toBeInTheDocument();
    });

    it('redirects to login when token is invalid', async () => {
        isTokenValid.mockResolvedValue(false);

        renderProtectedRoute();

        expect(await screen.findByText('Login Page')).toBeInTheDocument();
    });

    it('shows loading indicator while checking authentication', () => {
        isTokenValid.mockResolvedValue(new Promise(() => {})); // never resolves

        renderProtectedRoute();

        expect(screen.getByText(/checking authentication/i)).toBeInTheDocument();
    });
});
