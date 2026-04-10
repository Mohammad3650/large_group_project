import { describe, it, expect } from 'vitest';
import sumTotalTasks from '../../../utils/Helpers/sumTotalTasks.js';

describe('sumTotalTasks', () => {
    const emptyGroups = {
        pinnedTasks: [],
        overdueTasks: [],
        todayTasks: [],
        tomorrowTasks: [],
        weekTasks: [],
        beyondWeekTasks: [],
        completedTasks: [],
    };

    it('returns zero when all groups are empty', () => {
        expect(sumTotalTasks(emptyGroups)).toBe(0);
    });

    it('counts pinned tasks', () => {
        expect(sumTotalTasks({ ...emptyGroups, pinnedTasks: [1, 2] })).toBe(2);
    });

    it('counts overdue tasks', () => {
        expect(sumTotalTasks({ ...emptyGroups, overdueTasks: [1] })).toBe(1);
    });

    it('counts today tasks', () => {
        expect(sumTotalTasks({ ...emptyGroups, todayTasks: [1] })).toBe(1);
    });

    it('counts tomorrow tasks', () => {
        expect(sumTotalTasks({ ...emptyGroups, tomorrowTasks: [1] })).toBe(1);
    });

    it('counts week tasks', () => {
        expect(sumTotalTasks({ ...emptyGroups, weekTasks: [1] })).toBe(1);
    });

    it('counts beyond week tasks', () => {
        expect(sumTotalTasks({ ...emptyGroups, beyondWeekTasks: [1] })).toBe(1);
    });

    it('counts completed tasks', () => {
        expect(sumTotalTasks({ ...emptyGroups, completedTasks: [1] })).toBe(1);
    });

    it('sums tasks across all groups', () => {
        const groups = {
            pinnedTasks: [1, 2],
            overdueTasks: [1],
            todayTasks: [1, 2, 3],
            tomorrowTasks: [1],
            weekTasks: [1, 2],
            beyondWeekTasks: [1],
            completedTasks: [1, 2],
        };
        expect(sumTotalTasks(groups)).toBe(12);
    });
});
