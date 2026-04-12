import { describe, it, expect } from 'vitest';
import sumTotalTasks from '../../../utils/Helpers/sumTotalTasks.js';

const emptyGroups = {
    pinnedTasks: [], overdueTasks: [], todayTasks: [], tomorrowTasks: [],
    weekTasks: [], beyondWeekTasks: [], completedTasks: [],
};

describe('sumTotalTasks', () => {
    it('returns zero when all groups are empty', () => {
        expect(sumTotalTasks(emptyGroups)).toBe(0);
    });

    it.each([
        ['pinnedTasks', 2],
        ['overdueTasks', 1],
        ['todayTasks', 1],
        ['tomorrowTasks', 1],
        ['weekTasks', 1],
        ['beyondWeekTasks', 1],
        ['completedTasks', 1],
    ])('counts %s', (group, count) => {
        const items = Array(count).fill(1);
        expect(sumTotalTasks({ ...emptyGroups, [group]: items })).toBe(count);
    });

    it('sums tasks across all groups', () => {
        expect(sumTotalTasks({
            pinnedTasks: [1, 2], overdueTasks: [1], todayTasks: [1, 2, 3],
            tomorrowTasks: [1], weekTasks: [1, 2], beyondWeekTasks: [1], completedTasks: [1, 2],
        })).toBe(12);
    });
});