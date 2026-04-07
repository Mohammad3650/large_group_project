import { describe, it, expect, vi, beforeEach } from 'vitest';
import buildTaskGroups from '../Helpers/buildTaskGroups.js';
import * as handleCompleteTaskModule from '../Helpers/handleCompleteTask.js';
import * as handleUndoCompleteTaskModule from '../Helpers/handleUndoCompleteTask.js';
import * as handleUndoCompletePinnedTaskModule from '../Helpers/handleUndoCompletePinnedTask.js';
import * as handlePinTaskModule from '../Helpers/handlePinTask.js';
import * as handleUnpinTaskModule from '../Helpers/handleUnpinTask.js';

vi.mock('../Helpers/handleCompleteTask.js', () => ({ default: vi.fn() }));
vi.mock('../Helpers/handleUndoCompleteTask.js', () => ({ default: vi.fn() }));
vi.mock('../Helpers/handleUndoCompletePinnedTask.js', () => ({ default: vi.fn() }));
vi.mock('../Helpers/handlePinTask.js', () => ({ default: vi.fn() }));
vi.mock('../Helpers/handleUnpinTask.js', () => ({ default: vi.fn() }));

const makeTask = (id) => ({ id, name: `Task ${id}` });

const filteredTasks = {
    filteredPinned: [makeTask(1)],
    filteredOverdue: [makeTask(2)],
    filteredToday: [makeTask(3)],
    filteredTomorrow: [makeTask(4)],
    filteredWeek: [makeTask(5)],
    filteredBeyondWeek: [makeTask(6)],
    filteredCompleted: [makeTask(7)],
};

const setters = {
    setPinnedTasks: vi.fn(),
    setOverdueTasks: vi.fn(),
    setTodayTasks: vi.fn(),
    setTomorrowTasks: vi.fn(),
    setWeekTasks: vi.fn(),
    setBeyondWeekTasks: vi.fn(),
    setCompletedTasks: vi.fn(),
};

describe('buildTaskGroups', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns an array of 7 task groups', () => {
        const groups = buildTaskGroups(filteredTasks, setters);
        expect(groups).toHaveLength(7);
    });

    it('returns groups in the correct order', () => {
        const groups = buildTaskGroups(filteredTasks, setters);
        const titles = groups.map((g) => g.title);
        expect(titles).toEqual([
            'Pinned',
            'Overdue',
            'Today',
            'Tomorrow',
            'Next 7 Days',
            'After Next 7 Days',
            'Completed',
        ]);
    });

    it('assigns the correct variant to each group', () => {
        const groups = buildTaskGroups(filteredTasks, setters);
        const variants = groups.map((g) => g.variant);
        expect(variants).toEqual([
            'pinned', 'overdue', 'today', 'tomorrow', 'week', 'beyond', 'completed',
        ]);
    });

    it('assigns the correct filtered tasks to each group', () => {
        const groups = buildTaskGroups(filteredTasks, setters);
        expect(groups[0].tasks).toBe(filteredTasks.filteredPinned);
        expect(groups[1].tasks).toBe(filteredTasks.filteredOverdue);
        expect(groups[2].tasks).toBe(filteredTasks.filteredToday);
        expect(groups[3].tasks).toBe(filteredTasks.filteredTomorrow);
        expect(groups[4].tasks).toBe(filteredTasks.filteredWeek);
        expect(groups[5].tasks).toBe(filteredTasks.filteredBeyondWeek);
        expect(groups[6].tasks).toBe(filteredTasks.filteredCompleted);
    });

    it('assigns the correct setter to each group', () => {
        const groups = buildTaskGroups(filteredTasks, setters);
        expect(groups[0].setTasks).toBe(setters.setPinnedTasks);
        expect(groups[1].setTasks).toBe(setters.setOverdueTasks);
        expect(groups[2].setTasks).toBe(setters.setTodayTasks);
        expect(groups[3].setTasks).toBe(setters.setTomorrowTasks);
        expect(groups[4].setTasks).toBe(setters.setWeekTasks);
        expect(groups[5].setTasks).toBe(setters.setBeyondWeekTasks);
        expect(groups[6].setTasks).toBe(setters.setCompletedTasks);
    });

    it('calls handleCompleteTask with the correct setters when onComplete is called on the pinned group', () => {
        const groups = buildTaskGroups(filteredTasks, setters);
        const task = makeTask(1);
        groups[0].onComplete(task);
        expect(handleCompleteTaskModule.default).toHaveBeenCalledWith(task, setters.setPinnedTasks, setters.setCompletedTasks);
    });

    it('calls handleCompleteTask with the correct setters when onComplete is called on the overdue group', () => {
        const groups = buildTaskGroups(filteredTasks, setters);
        const task = makeTask(2);
        groups[1].onComplete(task);
        expect(handleCompleteTaskModule.default).toHaveBeenCalledWith(task, setters.setOverdueTasks, setters.setCompletedTasks);
    });

    it('calls handleCompleteTask with the correct setters when onComplete is called on the today group', () => {
        const groups = buildTaskGroups(filteredTasks, setters);
        const task = makeTask(3);
        groups[2].onComplete(task);
        expect(handleCompleteTaskModule.default).toHaveBeenCalledWith(task, setters.setTodayTasks, setters.setCompletedTasks);
    });

    it('calls handleCompleteTask with the correct setters when onComplete is called on the tomorrow group', () => {
        const groups = buildTaskGroups(filteredTasks, setters);
        const task = makeTask(4);
        groups[3].onComplete(task);
        expect(handleCompleteTaskModule.default).toHaveBeenCalledWith(task, setters.setTomorrowTasks, setters.setCompletedTasks);
    });

    it('calls handleCompleteTask with the correct setters when onComplete is called on the week group', () => {
        const groups = buildTaskGroups(filteredTasks, setters);
        const task = makeTask(5);
        groups[4].onComplete(task);
        expect(handleCompleteTaskModule.default).toHaveBeenCalledWith(task, setters.setWeekTasks, setters.setCompletedTasks);
    });

    it('calls handleCompleteTask with the correct setters when onComplete is called on the beyond group', () => {
        const groups = buildTaskGroups(filteredTasks, setters);
        const task = makeTask(6);
        groups[5].onComplete(task);
        expect(handleCompleteTaskModule.default).toHaveBeenCalledWith(task, setters.setBeyondWeekTasks, setters.setCompletedTasks);
    });

    it('calls handleUndoCompletePinnedTask with the correct setters when onUndoComplete is called on the pinned group', () => {
        const groups = buildTaskGroups(filteredTasks, setters);
        const task = makeTask(1);
        groups[0].onUndoComplete(task);
        expect(handleUndoCompletePinnedTaskModule.default).toHaveBeenCalledWith(task, { setPinnedTasks: setters.setPinnedTasks });
    });

    it('calls handleUndoCompleteTask with the correct setters when onUndoComplete is called on the completed group', () => {
        const groups = buildTaskGroups(filteredTasks, setters);
        const task = makeTask(7);
        groups[6].onUndoComplete(task);
        expect(handleUndoCompleteTaskModule.default).toHaveBeenCalledWith(task, {
            setCompletedTasks: setters.setCompletedTasks,
            setOverdueTasks: setters.setOverdueTasks,
            setTodayTasks: setters.setTodayTasks,
            setTomorrowTasks: setters.setTomorrowTasks,
            setWeekTasks: setters.setWeekTasks,
            setBeyondWeekTasks: setters.setBeyondWeekTasks,
        });
    });

    it('calls handlePinTask with the correct setters when onPin is called on the overdue group', () => {
        const groups = buildTaskGroups(filteredTasks, setters);
        const task = makeTask(2);
        groups[1].onPin(task);
        expect(handlePinTaskModule.default).toHaveBeenCalledWith(task, setters.setOverdueTasks, setters.setPinnedTasks);
    });

    it('calls handlePinTask with the correct setters when onPin is called on the today group', () => {
        const groups = buildTaskGroups(filteredTasks, setters);
        const task = makeTask(3);
        groups[2].onPin(task);
        expect(handlePinTaskModule.default).toHaveBeenCalledWith(task, setters.setTodayTasks, setters.setPinnedTasks);
    });

    it('calls handlePinTask with the correct setters when onPin is called on the tomorrow group', () => {
        const groups = buildTaskGroups(filteredTasks, setters);
        const task = makeTask(4);
        groups[3].onPin(task);
        expect(handlePinTaskModule.default).toHaveBeenCalledWith(task, setters.setTomorrowTasks, setters.setPinnedTasks);
    });

    it('calls handlePinTask with the correct setters when onPin is called on the week group', () => {
        const groups = buildTaskGroups(filteredTasks, setters);
        const task = makeTask(5);
        groups[4].onPin(task);
        expect(handlePinTaskModule.default).toHaveBeenCalledWith(task, setters.setWeekTasks, setters.setPinnedTasks);
    });

    it('calls handlePinTask with the correct setters when onPin is called on the beyond group', () => {
        const groups = buildTaskGroups(filteredTasks, setters);
        const task = makeTask(6);
        groups[5].onPin(task);
        expect(handlePinTaskModule.default).toHaveBeenCalledWith(task, setters.setBeyondWeekTasks, setters.setPinnedTasks);
    });

    it('calls handlePinTask with the correct setters when onPin is called on the completed group', () => {
        const groups = buildTaskGroups(filteredTasks, setters);
        const task = makeTask(7);
        groups[6].onPin(task);
        expect(handlePinTaskModule.default).toHaveBeenCalledWith(task, setters.setCompletedTasks, setters.setPinnedTasks);
    });

    it('calls handleUnpinTask with the correct setters when onUnpin is called on the pinned group', () => {
        const groups = buildTaskGroups(filteredTasks, setters);
        const task = makeTask(1);
        groups[0].onUnpin(task);
        expect(handleUnpinTaskModule.default).toHaveBeenCalledWith(task, {
            setPinnedTasks: setters.setPinnedTasks,
            setCompletedTasks: setters.setCompletedTasks,
            setOverdueTasks: setters.setOverdueTasks,
            setTodayTasks: setters.setTodayTasks,
            setTomorrowTasks: setters.setTomorrowTasks,
            setWeekTasks: setters.setWeekTasks,
            setBeyondWeekTasks: setters.setBeyondWeekTasks,
        });
    });

    it('does not expose an onPin callback on the pinned group', () => {
        const groups = buildTaskGroups(filteredTasks, setters);
        expect(groups[0].onPin).toBeUndefined();
    });

    it('does not expose an onComplete callback on the completed group', () => {
        const groups = buildTaskGroups(filteredTasks, setters);
        expect(groups[6].onComplete).toBeUndefined();
    });

    it('does not expose an onUndoComplete callback on the overdue group', () => {
        const groups = buildTaskGroups(filteredTasks, setters);
        expect(groups[1].onUndoComplete).toBeUndefined();
    });

    it('does not expose an onUnpin callback on non-pinned groups', () => {
        const groups = buildTaskGroups(filteredTasks, setters);
        groups.slice(1).forEach((group) => {
            expect(group.onUnpin).toBeUndefined();
        });
    });
});