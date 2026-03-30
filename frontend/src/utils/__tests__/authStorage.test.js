import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAccessToken, getRefreshToken, saveTokens, logout } from '../authStorage';
import { setAuthToken } from '../../api';

vi.mock('../../api', () => ({
    setAuthToken: vi.fn()
}));

describe('authStorage utilities', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    describe('getAccessToken', () => {
        it('returns the access token from localStorage', () => {
            localStorage.setItem('access', 'mock-access');

            const result = getAccessToken();

            expect(result).toBe('mock-access');
        });

        it('returns null if no access token exists', () => {
            const result = getAccessToken();

            expect(result).toBeNull();
        });
    });

    describe('getRefreshToken', () => {
        it('returns the refresh token from localStorage', () => {
            localStorage.setItem('refresh', 'mock-refresh');

            const result = getRefreshToken();

            expect(result).toBe('mock-refresh');
        });

        it('returns null if no refresh token exists', () => {
            const result = getRefreshToken();

            expect(result).toBeNull();
        });
    });

    describe('saveTokens', () => {
        it('stores tokens in localStorage and sets auth header', () => {
            const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

            saveTokens('access-token', 'refresh-token');

            expect(localStorage.getItem('access')).toBe('access-token');
            expect(localStorage.getItem('refresh')).toBe('refresh-token');

            expect(setAuthToken).toHaveBeenCalledWith('access-token');

            expect(dispatchSpy).toHaveBeenCalledWith(
                expect.any(Event)
            );
            expect(dispatchSpy.mock.calls[0][0].type).toBe('auth-change');
        });
    });

    describe('logout', () => {
        it('removes tokens, clears auth header, and dispatches auth-change event', () => {
            localStorage.setItem('access', 'mock-access');
            localStorage.setItem('refresh', 'mock-refresh');

            const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

            logout();

            expect(localStorage.getItem('access')).toBeNull();
            expect(localStorage.getItem('refresh')).toBeNull();

            expect(setAuthToken).toHaveBeenCalledWith(null);

            expect(dispatchSpy).toHaveBeenCalledWith(
                expect.any(Event)
            );
            expect(dispatchSpy.mock.calls[0][0].type).toBe('auth-change');
        });
    });
});