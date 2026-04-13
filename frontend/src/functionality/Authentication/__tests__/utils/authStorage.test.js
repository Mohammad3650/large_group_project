import { describe, it, expect, vi, beforeEach } from "vitest";
import {
    getAccessToken,
    getRefreshToken,
    clearTokens,
    logout,
    saveTokens,
} from "../../utils/authStorage";
import { setAuthToken } from "../../../../api";
import { ACCESS_KEY, REFRESH_KEY } from "../../../../constants/authKeys";

vi.mock("../../../../api", () => ({
    setAuthToken: vi.fn(),
}));

const setTokens = ({ access, refresh } = {}) => {
    if (access !== undefined) localStorage.setItem("access", access);
    if (refresh !== undefined) localStorage.setItem("refresh", refresh);
};


describe('authStorage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('returns the stored access token', () => {
        localStorage.setItem(ACCESS_KEY, 'test-access');

        const result = getAccessToken();

        expect(result).toBe('test-access');
    });

    it('returns the stored refresh token', () => {
        localStorage.setItem(REFRESH_KEY, 'test-refresh');

        const result = getRefreshToken();

        expect(result).toBe('test-refresh');
    });

    it('returns null when tokens are not present', () => {
        expect(getAccessToken()).toBeNull();
        expect(getRefreshToken()).toBeNull();
    });

    it('saves tokens, sets the auth header, and dispatches an auth-change event', () => {
        const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');

        saveTokens('access-token', 'refresh-token');

        expect(localStorage.getItem(ACCESS_KEY)).toBe('access-token');
        expect(localStorage.getItem(REFRESH_KEY)).toBe('refresh-token');
        expect(setAuthToken).toHaveBeenCalledWith('access-token');
        expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(Event));
        expect(dispatchEventSpy.mock.calls[0][0].type).toBe('auth-change');
    });

    it('clears tokens, removes the auth header, and dispatches an auth-change event', () => {
        localStorage.setItem(ACCESS_KEY, 'access-token');
        localStorage.setItem(REFRESH_KEY, 'refresh-token');

        const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');

        clearTokens();

        expect(localStorage.getItem(ACCESS_KEY)).toBeNull();
        expect(localStorage.getItem(REFRESH_KEY)).toBeNull();
        expect(setAuthToken).toHaveBeenCalledWith(null);
        expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(Event));
        expect(dispatchEventSpy.mock.calls[0][0].type).toBe('auth-change');
    });

    it('logs out by clearing stored tokens and auth state', () => {
        localStorage.setItem(ACCESS_KEY, 'access-token');
        localStorage.setItem(REFRESH_KEY, 'refresh-token');

        logout();

        expect(localStorage.getItem(ACCESS_KEY)).toBeNull();
        expect(localStorage.getItem(REFRESH_KEY)).toBeNull();
        expect(setAuthToken).toHaveBeenCalledWith(null);
    });
});