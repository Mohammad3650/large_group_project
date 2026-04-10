import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import groupTasksByDateGroup from '../../../utils/Helpers/groupTasksByDateGroup.js';

describe('groupTasksByDateGroup', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-04-07T12:00:00'));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    const makeBlock = (overrides = {}) => ({
        name: 'Task', date: '2026-04-07', startTime: '10:00:00',
        pinned: false, pinned_at: null, completed_at: null, ...overrides,
    });

    it('returns all empty arrays for an empty input', () => {
        const result = groupTasksByDateGroup([]);
        ['pinnedTasks','overdueTasks','todayTasks','tomorrowTasks','weekTasks','beyondWeekTasks','completedTasks']
            .forEach(key => expect(result[key]).toEqual([]));
    });

    it('places a pinned block into pinnedTasks and excludes it from all date groups', () => {
        const block = makeBlock({ pinned: true, pinned_at: '2026-04-07T09:00:00' });
        const result = groupTasksByDateGroup([block]);
        expect(result.pinnedTasks).toContain(block);
        ['overdueTasks','todayTasks','tomorrowTasks','weekTasks','beyondWeekTasks','completedTasks']
            .forEach(key => expect(result[key]).toHaveLength(0));
    });

    it('places a completed non-pinned block into completedTasks', () => {
        const block = makeBlock({ completed_at: '2026-04-07T09:00:00' });
        const { completedTasks, overdueTasks, todayTasks } = groupTasksByDateGroup([block]);
        expect(completedTasks).toContain(block);
        expect(overdueTasks).toHaveLength(0);
        expect(todayTasks).toHaveLength(0);
    });

    it('places a block that is both pinned and completed into pinnedTasks only', () => {
        const block = makeBlock({ pinned: true, pinned_at: '2026-04-07T09:00:00', completed_at: '2026-04-07T10:00:00' });
        const { pinnedTasks, completedTasks } = groupTasksByDateGroup([block]);
        expect(pinnedTasks).toContain(block);
        expect(completedTasks).toHaveLength(0);
    });

    it.each([
        ['2026-04-06', 'overdueTasks'],
        ['2026-04-07', 'todayTasks'],
        ['2026-04-08', 'tomorrowTasks'],
        ['2026-04-10', 'weekTasks'],
        ['2026-04-15', 'beyondWeekTasks'],
    ])('places a block dated %s into %s', (date, group) => {
        const block = makeBlock({ date, startTime: '10:00:00' });
        const result = groupTasksByDateGroup([block]);
        expect(result[group]).toContain(block);
    });

    it('correctly partitions multiple blocks across all groups', () => {
        const pinned = makeBlock({ pinned: true, pinned_at: '2026-04-07T09:00:00' });
        const completed = makeBlock({ completed_at: '2026-04-07T09:00:00' });
        const overdue = makeBlock({ date: '2026-04-06', startTime: '09:00:00' });
        const today = makeBlock({ date: '2026-04-07', startTime: '09:00:00' });
        const tomorrow = makeBlock({ date: '2026-04-08', startTime: '09:00:00' });
        const week = makeBlock({ date: '2026-04-10', startTime: '09:00:00' });
        const beyond = makeBlock({ date: '2026-04-15', startTime: '09:00:00' });
        const result = groupTasksByDateGroup([pinned, completed, overdue, today, tomorrow, week, beyond]);
        expect(result.pinnedTasks).toEqual([pinned]);
        expect(result.completedTasks).toEqual([completed]);
        expect(result.overdueTasks).toEqual([overdue]);
        expect(result.todayTasks).toEqual([today]);
        expect(result.tomorrowTasks).toEqual([tomorrow]);
        expect(result.weekTasks).toEqual([week]);
        expect(result.beyondWeekTasks).toEqual([beyond]);
    });

    it('sorts pinnedTasks by pinned_at descending', () => {
        const older = makeBlock({ name: 'A', pinned: true, pinned_at: '2026-04-07T08:00:00' });
        const newer = makeBlock({ name: 'B', pinned: true, pinned_at: '2026-04-07T10:00:00' });
        const { pinnedTasks } = groupTasksByDateGroup([older, newer]);
        expect(pinnedTasks[0]).toBe(newer);
        expect(pinnedTasks[1]).toBe(older);
    });

    it('sorts completedTasks by completed_at descending', () => {
        const older = makeBlock({ name: 'A', completed_at: '2026-04-07T08:00:00' });
        const newer = makeBlock({ name: 'B', completed_at: '2026-04-07T10:00:00' });
        const { completedTasks } = groupTasksByDateGroup([older, newer]);
        expect(completedTasks[0]).toBe(newer);
        expect(completedTasks[1]).toBe(older);
    });

    it('sorts date group tasks by date ascending', () => {
        const earlier = makeBlock({ date: '2026-04-07', startTime: '08:00:00' });
        const later = makeBlock({ date: '2026-04-07', startTime: '11:00:00' });
        const { todayTasks } = groupTasksByDateGroup([later, earlier]);
        expect(todayTasks[0]).toBe(earlier);
        expect(todayTasks[1]).toBe(later);
    });
});