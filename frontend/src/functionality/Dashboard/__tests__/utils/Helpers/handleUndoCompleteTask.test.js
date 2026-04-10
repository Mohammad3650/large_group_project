import { describe, it, expect, vi, beforeEach } from 'vitest';
import handleUndoCompleteTask from '../../../utils/Helpers/handleUndoCompleteTask.js';

vi.mock('../../../utils/Api/undoCompleteTimeBlock.js', () => ({ default: vi.fn() }));
vi.mock('../../../utils/Helpers/restoreTaskToDateGroup.js', () => ({ default: vi.fn() }));

import * as undoCompleteTimeBlockModule from '../../../utils/Api/undoCompleteTimeBlock.js';
import * as restoreTaskToDateGroupModule from '../../../utils/Helpers/restoreTaskToDateGroup.js';

describe('handleUndoCompleteTask', () => {
    const task = { id: 1, name: 'Test Task', completed_at: '2026-04-07T10:00:00.000Z' };

    const makeSetters = () => ({
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

    it('calls undoCompleteTimeBlock with the task id', async () => {
        undoCompleteTimeBlockModule.default.mockResolvedValue({});
        handleUndoCompleteTask(task, makeSetters());
        await vi.waitFor(() =>
            expect(undoCompleteTimeBlockModule.default).toHaveBeenCalledWith(task.id)
        );
    });

    it('removes the task from completedTasks on success', async () => {
        undoCompleteTimeBlockModule.default.mockResolvedValue({});
        const setters = makeSetters();
        handleUndoCompleteTask(task, setters);
        await vi.waitFor(() => expect(setters.setCompletedTasks).toHaveBeenCalled());
        const filterFn = setters.setCompletedTasks.mock.calls[0][0];
        expect(filterFn([{ id: 1 }, { id: 2 }])).toEqual([{ id: 2 }]);
    });

    it('calls restoreTaskToDateGroup with completed_at cleared and the date group setters', async () => {
        undoCompleteTimeBlockModule.default.mockResolvedValue({});
        const setters = makeSetters();
        handleUndoCompleteTask(task, setters);
        await vi.waitFor(() =>
            expect(restoreTaskToDateGroupModule.default).toHaveBeenCalled()
        );
        const [restoredTask, passedSetters] = restoreTaskToDateGroupModule.default.mock.calls[0];
        expect(restoredTask).toMatchObject({ ...task, completed_at: null });
        expect(passedSetters).toEqual({
            setOverdueTasks: setters.setOverdueTasks,
            setTodayTasks: setters.setTodayTasks,
            setTomorrowTasks: setters.setTomorrowTasks,
            setWeekTasks: setters.setWeekTasks,
            setBeyondWeekTasks: setters.setBeyondWeekTasks,
        });
    });

    it('does not call any setter when the API call fails', async () => {
        undoCompleteTimeBlockModule.default.mockRejectedValue(new Error('Network error'));
        const setters = makeSetters();
        handleUndoCompleteTask(task, setters);
        await vi.waitFor(() =>
            expect(undoCompleteTimeBlockModule.default).toHaveBeenCalledWith(task.id)
        );
        expect(setters.setCompletedTasks).not.toHaveBeenCalled();
        expect(restoreTaskToDateGroupModule.default).not.toHaveBeenCalled();
    });
});
