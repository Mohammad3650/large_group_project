import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import handleCompleteTask from '../../../utils/Helpers/handleCompleteTask.js';

vi.mock('../Api/completeTimeBlock.js', () => ({ default: vi.fn() }));

import * as completeTimeBlockModule from '../../../utils/Api/completeTimeBlock.js';

describe('handleCompleteTask', () => {
    const task = { id: 1, name: 'Test Task', pinned: true, pinned_at: '2026-04-01T10:00:00.000Z' };

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-04-07T12:00:00.000Z'));
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('calls completeTimeBlock with the task id', async () => {
        completeTimeBlockModule.default.mockResolvedValue({});
        handleCompleteTask(task, vi.fn(), vi.fn());
        await vi.waitFor(() =>
            expect(completeTimeBlockModule.default).toHaveBeenCalledWith(task.id)
        );
    });

    it('removes the completed task from the source list on success', async () => {
        completeTimeBlockModule.default.mockResolvedValue({});
        const setSourceTasks = vi.fn();
        handleCompleteTask(task, setSourceTasks, vi.fn());
        await vi.waitFor(() => expect(setSourceTasks).toHaveBeenCalled());
        const filterFn = setSourceTasks.mock.calls[0][0];
        expect(filterFn([{ id: 1 }, { id: 2 }])).toEqual([{ id: 2 }]);
    });

    it('adds the task to completedTasks with completed_at set to now, pinned: false, and pinned_at: null', async () => {
        completeTimeBlockModule.default.mockResolvedValue({});
        const setCompletedTasks = vi.fn();
        handleCompleteTask(task, vi.fn(), setCompletedTasks);
        await vi.waitFor(() => expect(setCompletedTasks).toHaveBeenCalled());
        const updateFn = setCompletedTasks.mock.calls[0][0];
        const result = updateFn([]);
        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
            ...task,
            completed_at: expect.stringMatching(/^2026-04-07T12:/),
            pinned: false,
            pinned_at: null,
        });
    });

    it('sorts completedTasks by completed_at descending after adding', async () => {
        completeTimeBlockModule.default.mockResolvedValue({});
        const setCompletedTasks = vi.fn();
        const taskToComplete = { id: 3, name: 'New Task', pinned: false, pinned_at: null };
        handleCompleteTask(taskToComplete, vi.fn(), setCompletedTasks);
        await vi.waitFor(() => expect(setCompletedTasks).toHaveBeenCalled());
        const updateFn = setCompletedTasks.mock.calls[0][0];
        const existing = [{ id: 2, completed_at: '2026-04-07T13:00:00.000Z' }];
        const result = updateFn(existing);
        expect(result[0]).toBe(existing[0]);
        expect(result[1]).toMatchObject({ id: 3, completed_at: expect.stringMatching(/^2026-04-07T12:/) });
    });

    it('does not call setSourceTasks or setCompletedTasks when the API call fails', async () => {
        completeTimeBlockModule.default.mockRejectedValue(new Error('Network error'));
        const setSourceTasks = vi.fn();
        const setCompletedTasks = vi.fn();
        handleCompleteTask(task, setSourceTasks, setCompletedTasks);
        await vi.waitFor(() =>
            expect(completeTimeBlockModule.default).toHaveBeenCalledWith(task.id)
        );
        expect(setSourceTasks).not.toHaveBeenCalled();
        expect(setCompletedTasks).not.toHaveBeenCalled();
    });
});
