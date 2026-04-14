import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useAuthStatus from '../../utils/authStatus.js';
import { getAccessToken } from '../../utils/authStorage.js';

vi.mock('../../utils/authStorage.js', () => ({
    getAccessToken: vi.fn()
}));

describe('useAuthStatus', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('initialises as true when a token exists', () => {
        getAccessToken.mockReturnValue('token');

        const { result } = renderHook(() => useAuthStatus());

        expect(result.current).toBe(true);
    });

    it('initialises as false when no token exists', () => {
        getAccessToken.mockReturnValue(null);

        const { result } = renderHook(() => useAuthStatus());

        expect(result.current).toBe(false);
    });

    it('updates state when auth-change event is dispatched', () => {
        // start logged out
        getAccessToken.mockReturnValue(null);

        const { result } = renderHook(() => useAuthStatus());

        expect(result.current).toBe(false);

        // simulate login
        getAccessToken.mockReturnValue('token');

        act(() => {
            window.dispatchEvent(new Event('auth-change'));
        });

        expect(result.current).toBe(true);
    });

    it('updates state when storage event is dispatched', () => {
        getAccessToken.mockReturnValue(null);

        const { result } = renderHook(() => useAuthStatus());

        expect(result.current).toBe(false);

        // simulate token appearing
        getAccessToken.mockReturnValue('token');

        act(() => {
            window.dispatchEvent(new Event('storage'));
        });

        expect(result.current).toBe(true);
    });

    it('removes event listeners on unmount', () => {
        getAccessToken.mockReturnValue(null);

        const addSpy = vi.spyOn(window, 'addEventListener');
        const removeSpy = vi.spyOn(window, 'removeEventListener');

        const { unmount } = renderHook(() => useAuthStatus());

        // ensure listeners were added
        expect(addSpy).toHaveBeenCalledWith(
            'auth-change',
            expect.any(Function)
        );
        expect(addSpy).toHaveBeenCalledWith(
            'storage',
            expect.any(Function)
        );

        unmount();

        // ensure listeners were removed
        expect(removeSpy).toHaveBeenCalledWith(
            'auth-change',
            expect.any(Function)
        );
        expect(removeSpy).toHaveBeenCalledWith(
            'storage',
            expect.any(Function)
        );
    });
});