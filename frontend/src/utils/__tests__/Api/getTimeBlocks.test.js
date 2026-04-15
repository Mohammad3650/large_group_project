import { describe, it, expect, vi, beforeEach } from 'vitest';
import getTimeBlocks from '../../Api/getTimeBlocks.js';

vi.mock('../../../api.js', () => ({
    api: { get: vi.fn() },
}));

import * as apiModule from '../../../api.js';

describe('getTimeBlocks', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('calls api.get with the correct endpoint', async () => {
        apiModule.api.get.mockResolvedValue({ data: [] });
        await getTimeBlocks();
        expect(apiModule.api.get).toHaveBeenCalledWith('/api/time-blocks/get/');
    });

    it('returns the data from the response', async () => {
        const blocks = [{ id: 1 }, { id: 2 }];
        apiModule.api.get.mockResolvedValue({ data: blocks });
        const result = await getTimeBlocks();
        expect(result).toBe(blocks);
    });

    it('propagates errors from the API', async () => {
        apiModule.api.get.mockRejectedValue(new Error('Network error'));
        await expect(getTimeBlocks()).rejects.toThrow('Network error');
    });
});
