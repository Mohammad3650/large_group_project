import { describe, it, expect, vi, beforeEach } from 'vitest';
import undoCompleteTimeBlock from '../../../utils/Api/undoCompleteTimeBlock.js';
import * as apiModule from '../../../../../api.js';

vi.mock('../../../../../api.js', () => ({
    api: { patch: vi.fn() },
}));

describe('undoCompleteTimeBlock', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('calls the correct API endpoint with the given id', () => {
        apiModule.api.patch.mockResolvedValue({});
        undoCompleteTimeBlock(1);
        expect(apiModule.api.patch).toHaveBeenCalledWith('/api/time-blocks/1/undo-complete/');
    });

    it('returns the API response promise', () => {
        const mockResponse = { data: {} };
        apiModule.api.patch.mockResolvedValue(mockResponse);
        const result = undoCompleteTimeBlock(1);
        expect(result).toBeInstanceOf(Promise);
    });

    it('throws an error when id is null', () => {
        expect(() => undoCompleteTimeBlock(null)).toThrow('Invalid id');
    });

    it('throws an error when id is undefined', () => {
        expect(() => undoCompleteTimeBlock(undefined)).toThrow('Invalid id');
    });

    it('throws an error when id is zero', () => {
        expect(() => undoCompleteTimeBlock(0)).toThrow('Invalid id');
    });
});