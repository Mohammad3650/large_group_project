import { describe, it, expect } from 'vitest';
import sortTasksByPinnedAt from '../../../utils/Helpers/sortTasksByPinnedAt.js';

describe('sortTasksByPinnedAt', () => {
    it('returns a negative number when the first task was pinned more recently', () => {
        expect(sortTasksByPinnedAt(
            { pinned_at: '2026-04-07T12:00:00.000Z' },
            { pinned_at: '2026-04-07T10:00:00.000Z' }
        )).toBeLessThan(0);
    });

    it('returns a positive number when the second task was pinned more recently', () => {
        expect(sortTasksByPinnedAt(
            { pinned_at: '2026-04-07T10:00:00.000Z' },
            { pinned_at: '2026-04-07T12:00:00.000Z' }
        )).toBeGreaterThan(0);
    });

    it('returns zero when both tasks were pinned at the same time', () => {
        expect(sortTasksByPinnedAt(
            { pinned_at: '2026-04-07T10:00:00.000Z' },
            { pinned_at: '2026-04-07T10:00:00.000Z' }
        )).toBe(0);
    });

    it('sorts an array of tasks in descending order by pinned_at', () => {
        const tasks = [
            { pinned_at: '2026-04-07T09:00:00.000Z' },
            { pinned_at: '2026-04-07T12:00:00.000Z' },
            { pinned_at: '2026-04-07T10:00:00.000Z' },
        ];
        const sorted = tasks.slice().sort(sortTasksByPinnedAt);
        expect(sorted[0].pinned_at).toBe('2026-04-07T12:00:00.000Z');
        expect(sorted[2].pinned_at).toBe('2026-04-07T09:00:00.000Z');
    });
});
