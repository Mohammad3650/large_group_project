import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isTokenValid } from '../../utils/authToken.js';
import { publicApi } from '../../../../api.js';
import { getAccessToken, logout } from '../../utils/authStorage.js';

vi.mock('../../../../api.js', () => ({
    publicApi: {
        post: vi.fn()
    }
}));

vi.mock('../../utils/authStorage.js', () => ({
    getAccessToken: vi.fn(),
    logout: vi.fn()
}));

describe('isTokenValid', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns false immediately when no access token is stored', async () => {
        getAccessToken.mockReturnValue(null);

        const result = await isTokenValid();

        expect(result).toBe(false);
        expect(publicApi.post).not.toHaveBeenCalled();
        expect(logout).not.toHaveBeenCalled();
    });

    it('returns false immediately when the access token is an empty string', async () => {
        getAccessToken.mockReturnValue('');

        const result = await isTokenValid();

        expect(result).toBe(false);
        expect(publicApi.post).not.toHaveBeenCalled();
        expect(logout).not.toHaveBeenCalled();
    });

    it('returns true when token verification succeeds', async () => {
        getAccessToken.mockReturnValue('valid-token');
        publicApi.post.mockResolvedValue({});

        const result = await isTokenValid();

        expect(publicApi.post).toHaveBeenCalledTimes(1);
        expect(publicApi.post).toHaveBeenCalledWith(
            '/api/token/verify/',
            { token: 'valid-token' }
        );
        expect(result).toBe(true);
        expect(logout).not.toHaveBeenCalled();
    });

    it('logs out and returns false when verification fails with 401', async () => {
        getAccessToken.mockReturnValue('expired-token');
        publicApi.post.mockRejectedValue({
            response: { status: 401 }
        });

        const result = await isTokenValid();

        expect(publicApi.post).toHaveBeenCalledWith(
            '/api/token/verify/',
            { token: 'expired-token' }
        );
        expect(logout).toHaveBeenCalledTimes(1);
        expect(result).toBe(false);
    });

    it('logs out and returns false when verification fails with 403', async () => {
        getAccessToken.mockReturnValue('forbidden-token');
        publicApi.post.mockRejectedValue({
            response: { status: 403 }
        });

        const result = await isTokenValid();

        expect(publicApi.post).toHaveBeenCalledWith(
            '/api/token/verify/',
            { token: 'forbidden-token' }
        );
        expect(logout).toHaveBeenCalledTimes(1);
        expect(result).toBe(false);
    });

    it('returns false without logging out on non-auth server errors', async () => {
        getAccessToken.mockReturnValue('server-error-token');
        publicApi.post.mockRejectedValue({
            response: { status: 500 }
        });

        const result = await isTokenValid();

        expect(publicApi.post).toHaveBeenCalledWith(
            '/api/token/verify/',
            { token: 'server-error-token' }
        );
        expect(logout).not.toHaveBeenCalled();
        expect(result).toBe(false);
    });

    it('returns false without logging out when the error has no response', async () => {
        getAccessToken.mockReturnValue('no-response-token');
        publicApi.post.mockRejectedValue({});

        const result = await isTokenValid();

        expect(publicApi.post).toHaveBeenCalledWith(
            '/api/token/verify/',
            { token: 'no-response-token' }
        );
        expect(logout).not.toHaveBeenCalled();
        expect(result).toBe(false);
    });

    it('returns false without logging out on network errors', async () => {
        getAccessToken.mockReturnValue('network-error-token');
        publicApi.post.mockRejectedValue(new Error('Network error'));

        const result = await isTokenValid();

        expect(publicApi.post).toHaveBeenCalledWith(
            '/api/token/verify/',
            { token: 'network-error-token' }
        );
        expect(logout).not.toHaveBeenCalled();
        expect(result).toBe(false);
    });
});