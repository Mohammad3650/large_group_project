import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom/vitest';
import ProtectedRoute from '../../AuthComponents/ProtectedRoute.jsx';
import useProtectedRouteAccess from '../../utils/Hooks/useProtectedRouteAccess.js';

vi.mock('../../utils/Hooks/useProtectedRouteAccess.js', () => ({
    default: vi.fn()
}));

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

    it('renders protected content when access is allowed', () => {
        useProtectedRouteAccess.mockReturnValue(true);

        renderProtectedRoute();

        expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
    });

    it('redirects to login when access is denied', () => {
        useProtectedRouteAccess.mockReturnValue(false);

        renderProtectedRoute();

        expect(screen.getByText('Login Page')).toBeInTheDocument();
    });

    it('shows the loading screen while access is being checked', () => {
        useProtectedRouteAccess.mockReturnValue(null);

        renderProtectedRoute();

        expect(screen.getByText(/checking authentication/i)).toBeInTheDocument();
    });
});