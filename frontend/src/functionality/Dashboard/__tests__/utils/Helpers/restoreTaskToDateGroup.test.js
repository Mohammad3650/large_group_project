import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import restoreTaskToDateGroup from '../../../utils/Helpers/restoreTaskToDateGroup.js';

describe('restoreTaskToDateGroup', () => {
    const makeSetters = () => ({
        setOverdueTasks: vi.fn(), setTodayTasks: vi.fn(), setTomorrowTasks: vi.fn(),
        setWeekTasks: vi.fn(), setBeyondWeekTasks: vi.fn(),
    });

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-04-07T12:00:00'));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it.each([
        ['2026-04-06', 'setOverdueTasks'],
        ['2026-04-07', 'setTodayTasks'],
        ['2026-04-08', 'setTomorrowTasks'],
        ['2026-04-10', 'setWeekTasks'],
        ['2026-04-15', 'setBeyondWeekTasks'],
    ])('calls %s for a task dated %s', (date, setter) => {
        const setters = makeSetters();
        restoreTaskToDateGroup({ date, startTime: '10:00:00' }, setters);
        expect(setters[setter]).toHaveBeenCalled();
        Object.entries(setters)
            .filter(([key]) => key !== setter)
            .forEach(([, fn]) => expect(fn).not.toHaveBeenCalled());
    });

    it('appends the task to the existing list', () => {
        const task = { date: '2026-04-07', startTime: '10:00:00' };
        const setters = makeSetters();
        restoreTaskToDateGroup(task, setters);
        const updateFn = setters.setTodayTasks.mock.calls[0][0];
        expect(updateFn([])).toContain(task);
    });

    it('sorts the updated list by date ascending', () => {
        const earlier = { date: '2026-04-07', startTime: '08:00:00' };
        const later = { date: '2026-04-07', startTime: '11:00:00' };
        const setters = makeSetters();
        restoreTaskToDateGroup(later, setters);
        const updateFn = setters.setTodayTasks.mock.calls[0][0];
        const result = updateFn([earlier]);
        expect(result[0]).toBe(earlier);
        expect(result[1]).toBe(later);
    });
});