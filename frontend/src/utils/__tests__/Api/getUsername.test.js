import { describe, it, expect, vi, beforeEach } from 'vitest';
import getUsername from '../../Api/getUsername.js';

vi.mock('../../../api.js', () => ({
    api: { get: vi.fn() },
}));

import * as apiModule from '../../../api.js';

describe('getUsername', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('calls api.get with the correct endpoint', async () => {
        apiModule.api.get.mockResolvedValue({ data: { username: 'testuser' } });
        await getUsername();
        expect(apiModule.api.get).toHaveBeenCalledWith('/api/user/');
    });

    it('returns the username string from the response', async () => {
        apiModule.api.get.mockResolvedValue({ data: { username: 'testuser' } });
        const result = await getUsername();
        expect(result).toBe('testuser');
    });

    it('returns undefined when username is missing from the response', async () => {
        apiModule.api.get.mockResolvedValue({ data: {} });
        const result = await getUsername();
        expect(result).toBeUndefined();
    });

    it('propagates errors from the API', async () => {
        apiModule.api.get.mockRejectedValue(new Error('Network error'));
        await expect(getUsername()).rejects.toThrow('Network error');
    });
});