import { describe, it, expect, vi, beforeEach } from 'vitest';
import handleUnpinTask from '../../../utils/Helpers/handleUnpinTask.js';

vi.mock('../../../utils/Api/unpinTimeBlock.js', () => ({ default: vi.fn() }));
vi.mock('../../../utils/Helpers/restoreTaskToDateGroup.js', () => ({ default: vi.fn() }));

import * as unpinTimeBlockModule from '../../../utils/Api/unpinTimeBlock.js';
import * as restoreTaskToDateGroupModule from '../../../utils/Helpers/restoreTaskToDateGroup.js';

describe('handleUnpinTask', () => {
    const makeSetters = () => ({
        setPinnedTasks: vi.fn(),
        setCompletedTasks: vi.fn(),
        setOverdueTasks: vi.fn(),
        setTodayTasks: vi.fn(),
        setTomorrowTasks: vi.fn(),
        setWeekTasks: vi.fn(),
        setBeyondWeekTasks: vi.fn(),
    });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('calls unpinTimeBlock with the task id', async () => {
        unpinTimeBlockModule.default.mockResolvedValue({});
        const task = { id: 1, pinned: true, pinned_at: '2026-04-07T09:00:00.000Z', completed_at: null };
        handleUnpinTask(task, makeSetters());
        await vi.waitFor(() =>
            expect(unpinTimeBlockModule.default).toHaveBeenCalledWith(task.id)
        );
    });

    it('removes the task from pinnedTasks on success', async () => {
        unpinTimeBlockModule.default.mockResolvedValue({});
        const task = { id: 1, pinned: true, pinned_at: '2026-04-07T09:00:00.000Z', completed_at: null };
        const setters = makeSetters();
        handleUnpinTask(task, setters);
        await vi.waitFor(() => expect(setters.setPinnedTasks).toHaveBeenCalled());
        const filterFn = setters.setPinnedTasks.mock.calls[0][0];
        expect(filterFn([{ id: 1 }, { id: 2 }])).toEqual([{ id: 2 }]);
    });

    it('adds the task to completedTasks with pinned cleared when task is completed', async () => {
        unpinTimeBlockModule.default.mockResolvedValue({});
        const task = { id: 1, pinned: true, pinned_at: '2026-04-07T09:00:00.000Z', completed_at: '2026-04-07T10:00:00.000Z' };
        const setters = makeSetters();
        handleUnpinTask(task, setters);
        await vi.waitFor(() => expect(setters.setCompletedTasks).toHaveBeenCalled());
        const updateFn = setters.setCompletedTasks.mock.calls[0][0];
        const result = updateFn([]);
        expect(result[0]).toMatchObject({ id: 1, pinned: false, pinned_at: null, completed_at: task.completed_at });
        expect(restoreTaskToDateGroupModule.default).not.toHaveBeenCalled();
    });

    it('sorts completedTasks by completed_at descending after adding', async () => {
        unpinTimeBlockModule.default.mockResolvedValue({});
        const task = { id: 1, pinned: true, pinned_at: '2026-04-07T09:00:00.000Z', completed_at: '2026-04-07T10:00:00.000Z' };
        const setters = makeSetters();
        handleUnpinTask(task, setters);
        await vi.waitFor(() => expect(setters.setCompletedTasks).toHaveBeenCalled());
        const updateFn = setters.setCompletedTasks.mock.calls[0][0];
        const existing = [{ id: 2, completed_at: '2026-04-07T13:00:00.000Z' }];
        const result = updateFn(existing);
        expect(result[0]).toBe(existing[0]);
        expect(result[1]).toMatchObject({ id: 1 });
    });

    it('calls restoreTaskToDateGroup with pinned cleared when task is not completed', async () => {
        unpinTimeBlockModule.default.mockResolvedValue({});
        const task = { id: 1, pinned: true, pinned_at: '2026-04-07T09:00:00.000Z', completed_at: null };
        const setters = makeSetters();
        handleUnpinTask(task, setters);
        await vi.waitFor(() =>
            expect(restoreTaskToDateGroupModule.default).toHaveBeenCalled()
        );
        const [restoredTask, passedSetters] = restoreTaskToDateGroupModule.default.mock.calls[0];
        expect(restoredTask).toMatchObject({ id: 1, pinned: false, pinned_at: null });
        expect(passedSetters).toEqual({
            setOverdueTasks: setters.setOverdueTasks,
            setTodayTasks: setters.setTodayTasks,
            setTomorrowTasks: setters.setTomorrowTasks,
            setWeekTasks: setters.setWeekTasks,
            setBeyondWeekTasks: setters.setBeyondWeekTasks,
        });
        expect(setters.setCompletedTasks).not.toHaveBeenCalled();
    });

    it('does not call any setter when the API call fails', async () => {
        unpinTimeBlockModule.default.mockRejectedValue(new Error('Network error'));
        const task = { id: 1, pinned: true, pinned_at: '2026-04-07T09:00:00.000Z', completed_at: null };
        const setters = makeSetters();
        handleUnpinTask(task, setters);
        await vi.waitFor(() =>
            expect(unpinTimeBlockModule.default).toHaveBeenCalledWith(task.id)
        );
        expect(setters.setPinnedTasks).not.toHaveBeenCalled();
        expect(setters.setCompletedTasks).not.toHaveBeenCalled();
        expect(restoreTaskToDateGroupModule.default).not.toHaveBeenCalled();
    });
});
