import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import useRedirectIfAuthenticated from '../useRedirectIfAuthenticated.js';
import { isTokenValid } from '../authToken.js';

vi.mock('../authToken.js', () => ({
    isTokenValid: vi.fn()
}));

function TestComponent({ navigate, path }) {
    useRedirectIfAuthenticated(navigate, path);
    return <div>Test Component</div>;
}

describe('useRedirectIfAuthenticated', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('navigates to the default dashboard path when the token is valid', async () => {
        const mockNavigate = vi.fn();
        isTokenValid.mockResolvedValue(true);

        render(<TestComponent navigate={mockNavigate} />);

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
        });
    });

    it('navigates to a custom path when the token is valid', async () => {
        const mockNavigate = vi.fn();
        isTokenValid.mockResolvedValue(true);

        render(<TestComponent navigate={mockNavigate} path="/calendar" />);

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/calendar');
        });
    });

    it('does not navigate when the token is invalid', async () => {
        const mockNavigate = vi.fn();
        isTokenValid.mockResolvedValue(false);

        render(<TestComponent navigate={mockNavigate} />);

        await waitFor(() => {
            expect(isTokenValid).toHaveBeenCalledTimes(1);
        });

        expect(mockNavigate).not.toHaveBeenCalled();
    });
});