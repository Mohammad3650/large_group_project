import { describe, it, expect, vi, beforeEach } from 'vitest';
import getNotes from '../../../utils/Api/getNotes.js';

vi.mock('../../../../../api.js', () => ({
    api: { get: vi.fn() },
}));

import * as apiModule from '../../../../../api.js';

describe('getNotes', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('calls api.get with the correct endpoint', async () => {
        apiModule.api.get.mockResolvedValue({ data: { content: 'My notes' } });
        await getNotes();
        expect(apiModule.api.get).toHaveBeenCalledWith('/api/notes/get/');
    });

    it('returns the notes content from the response', async () => {
        apiModule.api.get.mockResolvedValue({ data: { content: 'My notes' } });
        const result = await getNotes();
        expect(result).toBe('My notes');
    });

    it('propagates errors from the API', async () => {
        apiModule.api.get.mockRejectedValue(new Error('Network error'));
        await expect(getNotes()).rejects.toThrow('Network error');
    });
});
