import { describe, it, expect, vi, beforeEach } from 'vitest';
import handleUndoCompletePinnedTask from '../Helpers/handleUndoCompletePinnedTask.js';

vi.mock('../Api/undoCompleteTimeBlock.js', () => ({ default: vi.fn() }));

import * as undoCompleteTimeBlockModule from '../Api/undoCompleteTimeBlock.js';

describe('handleUndoCompletePinnedTask', () => {
    const task = { id: 1, name: 'Test Task', pinned: true, completed_at: '2026-04-07T10:00:00.000Z' };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('calls undoCompleteTimeBlock with the task id', async () => {
        undoCompleteTimeBlockModule.default.mockResolvedValue({});
        handleUndoCompletePinnedTask(task, { setPinnedTasks: vi.fn() });
        await vi.waitFor(() =>
            expect(undoCompleteTimeBlockModule.default).toHaveBeenCalledWith(task.id)
        );
    });

    it('clears completed_at on the matching task in pinnedTasks', async () => {
        undoCompleteTimeBlockModule.default.mockResolvedValue({});
        const setPinnedTasks = vi.fn();
        handleUndoCompletePinnedTask(task, { setPinnedTasks });
        await vi.waitFor(() => expect(setPinnedTasks).toHaveBeenCalled());
        const updateFn = setPinnedTasks.mock.calls[0][0];
        const result = updateFn([task]);
        expect(result[0]).toMatchObject({ id: 1, completed_at: null });
    });

    it('leaves non-matching tasks unchanged', async () => {
        undoCompleteTimeBlockModule.default.mockResolvedValue({});
        const setPinnedTasks = vi.fn();
        handleUndoCompletePinnedTask(task, { setPinnedTasks });
        await vi.waitFor(() => expect(setPinnedTasks).toHaveBeenCalled());
        const updateFn = setPinnedTasks.mock.calls[0][0];
        const other = { id: 2, completed_at: '2026-04-07T09:00:00.000Z' };
        const result = updateFn([task, other]);
        expect(result[1]).toBe(other);
    });

    it('does not call setPinnedTasks when the API call fails', async () => {
        undoCompleteTimeBlockModule.default.mockRejectedValue(new Error('Network error'));
        const setPinnedTasks = vi.fn();
        handleUndoCompletePinnedTask(task, { setPinnedTasks });
        await vi.waitFor(() =>
            expect(undoCompleteTimeBlockModule.default).toHaveBeenCalledWith(task.id)
        );
        expect(setPinnedTasks).not.toHaveBeenCalled();
    });
});
