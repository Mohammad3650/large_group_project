import { describe, it, expect, vi, beforeEach } from 'vitest';
import handleDeleteDashboardTask from '../../../utils/Helpers/handleDeleteDashboardTask.js';

vi.mock('../Api/deleteTimeBlock.js', () => ({ default: vi.fn() }));

import * as deleteTimeBlockModule from '../../../../../utils/Api/deleteTimeBlock.js';

describe('Tests for handleDeleteDashboardTask', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('calls deleteTimeBlock with the correct id', async () => {
        deleteTimeBlockModule.default.mockResolvedValue({});
        handleDeleteDashboardTask(1, vi.fn());
        await vi.waitFor(() =>
            expect(deleteTimeBlockModule.default).toHaveBeenCalledWith(1)
        );
    });

    it('removes the deleted task from the list on success', async () => {
        deleteTimeBlockModule.default.mockResolvedValue({});
        const setTasks = vi.fn();
        const tasks = [{ id: 1 }, { id: 2 }];
        handleDeleteDashboardTask(1, setTasks);
        await vi.waitFor(() => expect(setTasks).toHaveBeenCalled());
        const filterFn = setTasks.mock.calls[0][0];
        expect(filterFn(tasks)).toEqual([{ id: 2 }]);
    });

    it('does not call setTasks when the API call fails', async () => {
        deleteTimeBlockModule.default.mockRejectedValue(new Error('Network error'));
        const setTasks = vi.fn();
        handleDeleteDashboardTask(1, setTasks);
        await vi.waitFor(() =>
            expect(deleteTimeBlockModule.default).toHaveBeenCalledWith(1)
        );
        expect(setTasks).not.toHaveBeenCalled();
    });
});
