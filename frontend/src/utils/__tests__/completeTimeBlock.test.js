import { describe, it, expect, vi, beforeEach } from 'vitest';
import completeTimeBlock from '../Api/completeTimeBlock.js';
import * as apiModule from '../../api.js';

vi.mock('../../api.js', () => ({
    api: {
        patch: vi.fn(),
    },
}));

describe('completeTimeBlock', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('calls the correct API endpoint with the given id', () => {
        apiModule.api.patch.mockResolvedValue({});
        completeTimeBlock(1);
        expect(apiModule.api.patch).toHaveBeenCalledWith('/api/time-blocks/1/complete/');
    });

    it('returns the API response promise', () => {
        const mockResponse = { data: {} };
        apiModule.api.patch.mockResolvedValue(mockResponse);
        const result = completeTimeBlock(1);
        expect(result).toBeInstanceOf(Promise);
    });

    it('throws an error when id is null', () => {
        expect(() => completeTimeBlock(null)).toThrow('Invalid id');
    });

    it('throws an error when id is undefined', () => {
        expect(() => completeTimeBlock(undefined)).toThrow('Invalid id');
    });

    it('throws an error when id is zero', () => {
        expect(() => completeTimeBlock(0)).toThrow('Invalid id');
    });
});