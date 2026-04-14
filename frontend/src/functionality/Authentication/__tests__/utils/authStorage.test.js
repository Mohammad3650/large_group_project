import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    getAccessToken,
    getRefreshToken,
    clearTokens,
    logout,
    saveTokens
} from '../../utils/authStorage';
import { setAuthToken } from '../../../../api.js';
import { ACCESS_KEY, REFRESH_KEY } from '../../../../constants/authKeys.js';

vi.mock('../../../../api.js', () => ({
    setAuthToken: vi.fn()
}));

vi.mock('../../../../constants/authKeys.js', () => ({
    ACCESS_KEY: 'access',
    REFRESH_KEY: 'refresh'
}));

describe('authStorage', () => {
    let dispatchSpy;

    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
        dispatchSpy = vi.spyOn(window, 'dispatchEvent');
    });

    afterEach(() => {
        dispatchSpy.mockRestore();
    });

    describe('getAccessToken', () => {
        it('returns the stored access token', () => {
            localStorage.setItem(ACCESS_KEY, 'access-token');

            expect(getAccessToken()).toBe('access-token');
        });

        it('returns null when no access token is stored', () => {
            expect(getAccessToken()).toBeNull();
        });
    });

    describe('getRefreshToken', () => {
        it('returns the stored refresh token', () => {
            localStorage.setItem(REFRESH_KEY, 'refresh-token');

            expect(getRefreshToken()).toBe('refresh-token');
        });

        it('returns null when no refresh token is stored', () => {
            expect(getRefreshToken()).toBeNull();
        });
    });

    describe('clearTokens', () => {
        it('removes both tokens, clears auth header, and dispatches auth-change', () => {
            localStorage.setItem(ACCESS_KEY, 'access-token');
            localStorage.setItem(REFRESH_KEY, 'refresh-token');

            clearTokens();

            expect(localStorage.getItem(ACCESS_KEY)).toBeNull();
            expect(localStorage.getItem(REFRESH_KEY)).toBeNull();
            expect(setAuthToken).toHaveBeenCalledTimes(1);
            expect(setAuthToken).toHaveBeenCalledWith(null);
            expect(dispatchSpy).toHaveBeenCalledTimes(1);

            const event = dispatchSpy.mock.calls[0][0];
            expect(event).toBeInstanceOf(Event);
            expect(event.type).toBe('auth-change');
        });

        it('still clears auth header and dispatches auth-change when tokens do not exist', () => {
            clearTokens();

            expect(localStorage.getItem(ACCESS_KEY)).toBeNull();
            expect(localStorage.getItem(REFRESH_KEY)).toBeNull();
            expect(setAuthToken).toHaveBeenCalledWith(null);
            expect(dispatchSpy).toHaveBeenCalledTimes(1);

            const event = dispatchSpy.mock.calls[0][0];
            expect(event.type).toBe('auth-change');
        });
    });

    describe('logout', () => {
        it('clears tokens, clears auth header, and dispatches auth-change', () => {
            localStorage.setItem(ACCESS_KEY, 'access-token');
            localStorage.setItem(REFRESH_KEY, 'refresh-token');

            logout();

            expect(localStorage.getItem(ACCESS_KEY)).toBeNull();
            expect(localStorage.getItem(REFRESH_KEY)).toBeNull();
            expect(setAuthToken).toHaveBeenCalledTimes(1);
            expect(setAuthToken).toHaveBeenCalledWith(null);
            expect(dispatchSpy).toHaveBeenCalledTimes(1);

            const event = dispatchSpy.mock.calls[0][0];
            expect(event.type).toBe('auth-change');
        });
    });

    describe('saveTokens', () => {
        it('stores both tokens, sets auth header, and dispatches auth-change', () => {
            saveTokens('new-access-token', 'new-refresh-token');

            expect(localStorage.getItem(ACCESS_KEY)).toBe('new-access-token');
            expect(localStorage.getItem(REFRESH_KEY)).toBe('new-refresh-token');
            expect(setAuthToken).toHaveBeenCalledTimes(1);
            expect(setAuthToken).toHaveBeenCalledWith('new-access-token');
            expect(dispatchSpy).toHaveBeenCalledTimes(1);

            const event = dispatchSpy.mock.calls[0][0];
            expect(event).toBeInstanceOf(Event);
            expect(event.type).toBe('auth-change');
        });

        it('overwrites existing stored tokens', () => {
            localStorage.setItem(ACCESS_KEY, 'old-access');
            localStorage.setItem(REFRESH_KEY, 'old-refresh');

            saveTokens('new-access', 'new-refresh');

            expect(localStorage.getItem(ACCESS_KEY)).toBe('new-access');
            expect(localStorage.getItem(REFRESH_KEY)).toBe('new-refresh');
            expect(setAuthToken).toHaveBeenCalledWith('new-access');
            expect(dispatchSpy).toHaveBeenCalledTimes(1);
        });
    });
});