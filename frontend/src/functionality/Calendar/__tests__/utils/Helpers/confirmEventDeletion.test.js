import { describe, it, expect, vi, afterEach } from 'vitest';
import confirmEventDeletion from '../../../utils/Helpers/confirmEventDeletion.js';
describe('confirmEventDeletion', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('returns true when the user confirms deletion', () => {
        vi.stubGlobal('confirm', vi.fn(() => true));

        const result = confirmEventDeletion();

        expect(globalThis.confirm).toHaveBeenCalledWith(
            'Are you sure you want to delete this event?'
        );
        expect(result).toBe(true);
    });

    it('returns false when the user cancels deletion', () => {
        vi.stubGlobal('confirm', vi.fn(() => false));

        const result = confirmEventDeletion();

        expect(globalThis.confirm).toHaveBeenCalledWith(
            'Are you sure you want to delete this event?'
        );
        expect(result).toBe(false);
    });
});