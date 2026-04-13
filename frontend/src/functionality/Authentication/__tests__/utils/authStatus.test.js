import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useAuthStatus from '../../utils/authStatus';
import { getAccessToken } from '../../utils/authStorage';

vi.mock('../../utils/authStorage', () => ({
    getAccessToken: vi.fn()
}));

describe('useAuthStatus', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('returns true on initial render when an access token exists', () => {
        getAccessToken.mockReturnValue('access-token');

        const { result } = renderHook(() => useAuthStatus());

        expect(result.current).toBe(true);
        expect(getAccessToken).toHaveBeenCalledTimes(1);
    });

    it('returns false on initial render when no access token exists', () => {
        getAccessToken.mockReturnValue(null);

        const { result } = renderHook(() => useAuthStatus());

        expect(result.current).toBe(false);
        expect(getAccessToken).toHaveBeenCalledTimes(1);
    });

    it('updates to true when an auth-change event is dispatched and a token now exists', () => {
        getAccessToken.mockReturnValue(null);

        const { result } = renderHook(() => useAuthStatus());

        expect(result.current).toBe(false);

        getAccessToken.mockReturnValue('new-token');

        act(() => {
            window.dispatchEvent(new Event('auth-change'));
        });

        expect(result.current).toBe(true);
    });

    it('updates to false when a storage event is dispatched and the token is removed', () => {
        getAccessToken.mockReturnValue('existing-token');

        const { result } = renderHook(() => useAuthStatus());

        expect(result.current).toBe(true);

        getAccessToken.mockReturnValue(null);

        act(() => {
            window.dispatchEvent(new Event('storage'));
        });

        expect(result.current).toBe(false);
    });

    it('removes event listeners on unmount', () => {
        getAccessToken.mockReturnValue('access-token');

        const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
        const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

        const { unmount } = renderHook(() => useAuthStatus());

        expect(addEventListenerSpy).toHaveBeenCalledWith(
            'auth-change',
            expect.any(Function)
        );
        expect(addEventListenerSpy).toHaveBeenCalledWith(
            'storage',
            expect.any(Function)
        );

        const authChangeListener = addEventListenerSpy.mock.calls.find(
            ([eventName]) => eventName === 'auth-change'
        )[1];

        const storageListener = addEventListenerSpy.mock.calls.find(
            ([eventName]) => eventName === 'storage'
        )[1];

        unmount();

        expect(removeEventListenerSpy).toHaveBeenCalledWith(
            'auth-change',
            authChangeListener
        );
        expect(removeEventListenerSpy).toHaveBeenCalledWith(
            'storage',
            storageListener
        );
    });
});