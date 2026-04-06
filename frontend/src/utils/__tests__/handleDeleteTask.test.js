import { describe, it, expect, vi, beforeEach } from 'vitest';
import handleDeleteTask from '../Helpers/handleDeleteTask.js';

vi.mock('../Api/deleteTimeBlock.js', () => ({ default: vi.fn() }));

import * as deleteTimeBlockModule from '../Api/deleteTimeBlock.js';

describe('Tests for handleDeleteTask', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('calls deleteTimeBlock with the correct id', async () => {
        deleteTimeBlockModule.default.mockResolvedValue({});
        handleDeleteTask(1, vi.fn());
        await vi.waitFor(() =>
            expect(deleteTimeBlockModule.default).toHaveBeenCalledWith(1)
        );
    });

    it('removes the deleted task from the list on success', async () => {
        deleteTimeBlockModule.default.mockResolvedValue({});
        const setTasks = vi.fn();
        const tasks = [{ id: 1 }, { id: 2 }];
        handleDeleteTask(1, setTasks);
        await vi.waitFor(() => expect(setTasks).toHaveBeenCalled());
        const filterFn = setTasks.mock.calls[0][0];
        expect(filterFn(tasks)).toEqual([{ id: 2 }]);
    });

    it('does not call setTasks when the API call fails', async () => {
        deleteTimeBlockModule.default.mockRejectedValue(new Error('Network error'));
        const setTasks = vi.fn();
        handleDeleteTask(1, setTasks);
        await vi.waitFor(() =>
            expect(deleteTimeBlockModule.default).toHaveBeenCalledWith(1)
        );
        expect(setTasks).not.toHaveBeenCalled();
    });
});
