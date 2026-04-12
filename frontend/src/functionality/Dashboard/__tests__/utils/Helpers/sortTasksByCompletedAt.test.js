import { describe, it, expect } from 'vitest';
import sortTasksByCompletedAt from '../../../utils/Helpers/sortTasksByCompletedAt.js';

describe('sortTasksByCompletedAt', () => {
    it('returns a negative number when the first task was completed more recently', () => {
        expect(sortTasksByCompletedAt(
            { completed_at: '2026-04-07T12:00:00.000Z' },
            { completed_at: '2026-04-07T10:00:00.000Z' }
        )).toBeLessThan(0);
    });

    it('returns a positive number when the second task was completed more recently', () => {
        expect(sortTasksByCompletedAt(
            { completed_at: '2026-04-07T10:00:00.000Z' },
            { completed_at: '2026-04-07T12:00:00.000Z' }
        )).toBeGreaterThan(0);
    });

    it('returns zero when both tasks were completed at the same time', () => {
        expect(sortTasksByCompletedAt(
            { completed_at: '2026-04-07T10:00:00.000Z' },
            { completed_at: '2026-04-07T10:00:00.000Z' }
        )).toBe(0);
    });

    it('sorts an array of tasks in descending order by completed_at', () => {
        const tasks = [
            { completed_at: '2026-04-07T09:00:00.000Z' },
            { completed_at: '2026-04-07T12:00:00.000Z' },
            { completed_at: '2026-04-07T10:00:00.000Z' },
        ];
        const sorted = tasks.slice().sort(sortTasksByCompletedAt);
        expect(sorted[0].completed_at).toBe('2026-04-07T12:00:00.000Z');
        expect(sorted[2].completed_at).toBe('2026-04-07T09:00:00.000Z');
    });
});