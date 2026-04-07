import { describe, it, expect, vi, beforeEach } from 'vitest';
import unpinTimeBlock from '../Api/unpinTimeBlock.js';
import * as apiModule from '../../api.js';

vi.mock('../../api.js', () => ({
    api: {
        patch: vi.fn(),
    },
}));

describe('unpinTimeBlock', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('calls the correct API endpoint with the given id', () => {
        apiModule.api.patch.mockResolvedValue({});
        unpinTimeBlock(1);
        expect(apiModule.api.patch).toHaveBeenCalledWith('/api/time-blocks/1/unpin/');
    });

    it('returns the API response promise', () => {
        const mockResponse = { data: {} };
        apiModule.api.patch.mockResolvedValue(mockResponse);
        const result = unpinTimeBlock(1);
        expect(result).toBeInstanceOf(Promise);
    });

    it('throws an error when id is null', () => {
        expect(() => unpinTimeBlock(null)).toThrow('Invalid id');
    });

    it('throws an error when id is undefined', () => {
        expect(() => unpinTimeBlock(undefined)).toThrow('Invalid id');
    });

    it('throws an error when id is zero', () => {
        expect(() => unpinTimeBlock(0)).toThrow('Invalid id');
    });
});