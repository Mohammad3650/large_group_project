import { describe, it, expect, vi, beforeEach } from 'vitest';
import pinTimeBlock from '../Api/pinTimeBlock.js';
import * as apiModule from '../../api.js';

vi.mock('../../api.js', () => ({
    api: {
        patch: vi.fn(),
    },
}));

describe('pinTimeBlock', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('calls the correct API endpoint with the given id', () => {
        apiModule.api.patch.mockResolvedValue({});
        pinTimeBlock(1);
        expect(apiModule.api.patch).toHaveBeenCalledWith('/api/time-blocks/1/pin/');
    });

    it('returns the API response promise', () => {
        const mockResponse = { data: {} };
        apiModule.api.patch.mockResolvedValue(mockResponse);
        const result = pinTimeBlock(1);
        expect(result).toBeInstanceOf(Promise);
    });

    it('throws an error when id is null', () => {
        expect(() => pinTimeBlock(null)).toThrow('Invalid id');
    });

    it('throws an error when id is undefined', () => {
        expect(() => pinTimeBlock(undefined)).toThrow('Invalid id');
    });

    it('throws an error when id is zero', () => {
        expect(() => pinTimeBlock(0)).toThrow('Invalid id');
    });
});