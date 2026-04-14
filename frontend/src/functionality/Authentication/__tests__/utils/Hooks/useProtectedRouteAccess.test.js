import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import useProtectedRouteAccess from '../../../utils/Hooks/useProtectedRouteAccess.js';
import { isTokenValid } from '../../../utils/authToken.js';

vi.mock('../../../utils/authToken.js', () => ({
    isTokenValid: vi.fn()
}));

describe('useProtectedRouteAccess', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns null initially while access is being checked', () => {
        isTokenValid.mockReturnValue(new Promise(() => { }));

        const { result } = renderHook(() => useProtectedRouteAccess());

        expect(result.current).toBeNull();
        expect(isTokenValid).toHaveBeenCalledTimes(1);
    });

    it('returns true when token validation succeeds', async () => {
        isTokenValid.mockResolvedValue(true);

        const { result } = renderHook(() => useProtectedRouteAccess());

        expect(result.current).toBeNull();

        await waitFor(() => {
            expect(result.current).toBe(true);
        });

        expect(isTokenValid).toHaveBeenCalledTimes(1);
    });

    it('returns false when token validation fails', async () => {
        isTokenValid.mockResolvedValue(false);

        const { result } = renderHook(() => useProtectedRouteAccess());

        expect(result.current).toBeNull();

        await waitFor(() => {
            expect(result.current).toBe(false);
        });

        expect(isTokenValid).toHaveBeenCalledTimes(1);
    });

    it('does not update state after unmounting before validation resolves', async () => {
        let resolveValidation;
        isTokenValid.mockReturnValue(
            new Promise((resolve) => {
                resolveValidation = resolve;
            })
        );

        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        const { result, unmount } = renderHook(() => useProtectedRouteAccess());

        expect(result.current).toBeNull();

        unmount();
        resolveValidation(true);

        await Promise.resolve();

        expect(result.current).toBeNull();
        expect(errorSpy).not.toHaveBeenCalled();

        errorSpy.mockRestore();
    });
});