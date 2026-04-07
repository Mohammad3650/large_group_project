import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import restoreTaskToDateGroup from '../Helpers/restoreTaskToDateGroup.js';

describe('restoreTaskToDateGroup', () => {
    const makeSetters = () => ({
        setOverdueTasks: vi.fn(),
        setTodayTasks: vi.fn(),
        setTomorrowTasks: vi.fn(),
        setWeekTasks: vi.fn(),
        setBeyondWeekTasks: vi.fn(),
    });

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-04-07T12:00:00'));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('calls setOverdueTasks for a task dated before today', () => {
        const task = { date: '2026-04-06', startTime: '10:00:00' };
        const setters = makeSetters();
        restoreTaskToDateGroup(task, setters);
        expect(setters.setOverdueTasks).toHaveBeenCalled();
        expect(setters.setTodayTasks).not.toHaveBeenCalled();
        expect(setters.setTomorrowTasks).not.toHaveBeenCalled();
        expect(setters.setWeekTasks).not.toHaveBeenCalled();
        expect(setters.setBeyondWeekTasks).not.toHaveBeenCalled();
    });

    it('calls setTodayTasks for a task dated today', () => {
        const task = { date: '2026-04-07', startTime: '10:00:00' };
        const setters = makeSetters();
        restoreTaskToDateGroup(task, setters);
        expect(setters.setTodayTasks).toHaveBeenCalled();
        expect(setters.setOverdueTasks).not.toHaveBeenCalled();
    });

    it('calls setTomorrowTasks for a task dated tomorrow', () => {
        const task = { date: '2026-04-08', startTime: '10:00:00' };
        const setters = makeSetters();
        restoreTaskToDateGroup(task, setters);
        expect(setters.setTomorrowTasks).toHaveBeenCalled();
        expect(setters.setTodayTasks).not.toHaveBeenCalled();
    });

    it('calls setWeekTasks for a task within the week range', () => {
        const task = { date: '2026-04-10', startTime: '10:00:00' };
        const setters = makeSetters();
        restoreTaskToDateGroup(task, setters);
        expect(setters.setWeekTasks).toHaveBeenCalled();
        expect(setters.setTomorrowTasks).not.toHaveBeenCalled();
        expect(setters.setBeyondWeekTasks).not.toHaveBeenCalled();
    });

    it('calls setBeyondWeekTasks for a task beyond the week boundary', () => {
        const task = { date: '2026-04-15', startTime: '10:00:00' };
        const setters = makeSetters();
        restoreTaskToDateGroup(task, setters);
        expect(setters.setBeyondWeekTasks).toHaveBeenCalled();
        expect(setters.setWeekTasks).not.toHaveBeenCalled();
    });

    it('appends the task to the existing list', () => {
        const task = { date: '2026-04-07', startTime: '10:00:00' };
        const setters = makeSetters();
        restoreTaskToDateGroup(task, setters);
        const updateFn = setters.setTodayTasks.mock.calls[0][0];
        const result = updateFn([]);
        expect(result).toContain(task);
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
