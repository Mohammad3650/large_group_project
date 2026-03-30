import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import useAuthStatus from '../authStatus';
import { getAccessToken } from '../authStorage';

vi.mock('../authStorage', () => ({
    getAccessToken: vi.fn()
}));

describe('useAuthStatus', () => {
    function renderUseAuthStatus() {
        return renderHook(() => useAuthStatus());
    }

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('returns true on first render when an access token exists', () => {
        getAccessToken.mockReturnValue('mock-token');

        const { result } = renderUseAuthStatus();

        expect(result.current).toBe(true);
        expect(getAccessToken).toHaveBeenCalled();
    });

    it('returns false on first render when no access token exists', () => {
        getAccessToken.mockReturnValue(null);

        const { result } = renderUseAuthStatus();

        expect(result.current).toBe(false);
        expect(getAccessToken).toHaveBeenCalled();
    });

    it('updates to true when an auth-change event is dispatched and a token exists', () => {
        getAccessToken.mockReturnValue(null);

        const { result } = renderUseAuthStatus();

        expect(result.current).toBe(false);

        getAccessToken.mockReturnValue('new-token');

        act(() => {
            window.dispatchEvent(new Event('auth-change'));
        });

        expect(result.current).toBe(true);
    });

    it('updates to false when a storage event is dispatched and the token is removed', () => {
        getAccessToken.mockReturnValue('mock-token');

        const { result } = renderUseAuthStatus();

        expect(result.current).toBe(true);

        getAccessToken.mockReturnValue(null);

        act(() => {
            window.dispatchEvent(new Event('storage'));
        });

        expect(result.current).toBe(false);
    });

    it('registers event listeners on mount and removes them on unmount', () => {
        getAccessToken.mockReturnValue(null);

        const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
        const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

        const { unmount } = renderUseAuthStatus();

        expect(addEventListenerSpy).toHaveBeenCalledWith(
            'auth-change',
            expect.any(Function)
        );
        expect(addEventListenerSpy).toHaveBeenCalledWith(
            'storage',
            expect.any(Function)
        );

        unmount();

        expect(removeEventListenerSpy).toHaveBeenCalledWith(
            'auth-change',
            expect.any(Function)
        );
        expect(removeEventListenerSpy).toHaveBeenCalledWith(
            'storage',
            expect.any(Function)
        );
    });
});