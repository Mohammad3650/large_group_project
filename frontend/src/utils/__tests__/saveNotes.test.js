import { describe, it, expect, vi, beforeEach } from 'vitest';
import saveNotes from '../Api/saveNotes.js';

vi.mock('../../api.js', () => ({
    api: { put: vi.fn() },
}));

import * as apiModule from '../../api.js';

describe('saveNotes', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('calls api.put with the correct endpoint and content', async () => {
        apiModule.api.put.mockResolvedValue({});
        await saveNotes('Hello world');
        expect(apiModule.api.put).toHaveBeenCalledWith('/api/notes/save/', { content: 'Hello world' });
    });

    it('returns the API response', async () => {
        const response = { data: 'ok' };
        apiModule.api.put.mockResolvedValue(response);
        const result = await saveNotes('content');
        expect(result).toBe(response);
    });

    it('propagates errors from the API', async () => {
        apiModule.api.put.mockRejectedValue(new Error('Network error'));
        await expect(saveNotes('content')).rejects.toThrow('Network error');
    });
});
