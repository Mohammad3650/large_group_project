import { describe, it, expect, vi, beforeEach } from 'vitest';
import buildTaskGroups from '../../../utils/Helpers/buildTaskGroups.js';
import * as handleCompleteTaskModule from '../../../utils/Helpers/handleCompleteTask.js';
import * as handleUndoCompleteTaskModule from '../../../utils/Helpers/handleUndoCompleteTask.js';
import * as handleUndoCompletePinnedTaskModule from '../../../utils/Helpers/handleUndoCompletePinnedTask.js';
import * as handlePinTaskModule from '../../../utils/Helpers/handlePinTask.js';
import * as handleUnpinTaskModule from '../../../utils/Helpers/handleUnpinTask.js';

vi.mock('../../../utils/Helpers/handleCompleteTask.js', () => ({ default: vi.fn() }));
vi.mock('../../../utils/Helpers/handleUndoCompleteTask.js', () => ({ default: vi.fn() }));
vi.mock('../../../utils/Helpers/handleUndoCompletePinnedTask.js', () => ({ default: vi.fn() }));
vi.mock('../../../utils/Helpers/handlePinTask.js', () => ({ default: vi.fn() }));
vi.mock('../../../utils/Helpers/handleUnpinTask.js', () => ({ default: vi.fn() }));

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
        expect(buildTaskGroups(filteredTasks, setters)).toHaveLength(7);
    });

    it('returns groups in the correct order with correct titles', () => {
        const titles = buildTaskGroups(filteredTasks, setters).map(g => g.title);
        expect(titles).toEqual(['Pinned', 'Overdue', 'Today', 'Tomorrow', 'Next 7 Days', 'After Next 7 Days', 'Completed']);
    });

    it('assigns the correct variant to each group', () => {
        const variants = buildTaskGroups(filteredTasks, setters).map(g => g.variant);
        expect(variants).toEqual(['pinned', 'overdue', 'today', 'tomorrow', 'week', 'beyond', 'completed']);
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

    it.each([
        [0, 'setPinnedTasks'],
        [1, 'setOverdueTasks'],
        [2, 'setTodayTasks'],
        [3, 'setTomorrowTasks'],
        [4, 'setWeekTasks'],
        [5, 'setBeyondWeekTasks'],
    ])('group %i calls handleCompleteTask with its setter and setCompletedTasks on onComplete', (idx, setterName) => {
        const groups = buildTaskGroups(filteredTasks, setters);
        const task = makeTask(idx + 1);
        groups[idx].onComplete(task);
        expect(handleCompleteTaskModule.default).toHaveBeenCalledWith(task, setters[setterName], setters.setCompletedTasks);
    });

    it('calls handleUndoCompletePinnedTask with correct args when onUndoComplete called on pinned group', () => {
        const groups = buildTaskGroups(filteredTasks, setters);
        const task = makeTask(1);
        groups[0].onUndoComplete(task);
        expect(handleUndoCompletePinnedTaskModule.default).toHaveBeenCalledWith(task, { setPinnedTasks: setters.setPinnedTasks });
    });

    it('calls handleUndoCompleteTask with correct args when onUndoComplete called on completed group', () => {
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

    it.each([
        [1, 'setOverdueTasks'],
        [2, 'setTodayTasks'],
        [3, 'setTomorrowTasks'],
        [4, 'setWeekTasks'],
        [5, 'setBeyondWeekTasks'],
        [6, 'setCompletedTasks'],
    ])('group %i calls handlePinTask with its setter and setPinnedTasks on onPin', (idx, setterName) => {
        const groups = buildTaskGroups(filteredTasks, setters);
        const task = makeTask(idx + 1);
        groups[idx].onPin(task);
        expect(handlePinTaskModule.default).toHaveBeenCalledWith(task, setters[setterName], setters.setPinnedTasks);
    });

    it('calls handleUnpinTask with all setters when onUnpin called on pinned group', () => {
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

    it('does not expose onPin on the pinned group', () => {
        expect(buildTaskGroups(filteredTasks, setters)[0].onPin).toBeUndefined();
    });

    it('does not expose onComplete on the completed group', () => {
        expect(buildTaskGroups(filteredTasks, setters)[6].onComplete).toBeUndefined();
    });

    it('does not expose onUndoComplete on non-pinned, non-completed groups', () => {
        buildTaskGroups(filteredTasks, setters).slice(1, 6).forEach(group => {
            expect(group.onUndoComplete).toBeUndefined();
        });
    });

    it('does not expose onUnpin on non-pinned groups', () => {
        buildTaskGroups(filteredTasks, setters).slice(1).forEach(group => {
            expect(group.onUnpin).toBeUndefined();
        });
    });
});