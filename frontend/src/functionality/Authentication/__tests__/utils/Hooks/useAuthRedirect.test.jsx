import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import useAuthRedirect from '../../../utils/Hooks/useAuthRedirect.js';
import { isTokenValid } from '../../../utils/authToken.js';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');

    return {
        ...actual,
        useNavigate: () => mockNavigate
    };
});

vi.mock('../../../utils/authToken.js', () => ({
    isTokenValid: vi.fn()
}));

describe('useAuthRedirect', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('redirects authenticated users to the default dashboard path', async () => {
        isTokenValid.mockResolvedValue(true);

        renderHook(() => useAuthRedirect());

        await waitFor(() => {
            expect(isTokenValid).toHaveBeenCalledTimes(1);
            expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
        });
    });

    it('redirects authenticated users to a custom path when provided', async () => {
        isTokenValid.mockResolvedValue(true);

        renderHook(() => useAuthRedirect('/profile'));

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/profile');
        });
    });

    it('does not redirect unauthenticated users', async () => {
        isTokenValid.mockResolvedValue(false);

        renderHook(() => useAuthRedirect());

        await waitFor(() => {
            expect(isTokenValid).toHaveBeenCalledTimes(1);
        });

        expect(mockNavigate).not.toHaveBeenCalled();
    });
});