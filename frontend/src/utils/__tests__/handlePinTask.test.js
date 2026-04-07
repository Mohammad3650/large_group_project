import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import handlePinTask from '../Helpers/handlePinTask.js';

vi.mock('../Api/pinTimeBlock.js', () => ({ default: vi.fn() }));

import * as pinTimeBlockModule from '../Api/pinTimeBlock.js';

describe('handlePinTask', () => {
    const task = { id: 1, name: 'Test Task', pinned: false, pinned_at: null };

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-04-07T12:00:00.000Z'));
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('calls pinTimeBlock with the task id', async () => {
        pinTimeBlockModule.default.mockResolvedValue({});
        handlePinTask(task, vi.fn(), vi.fn());
        await vi.waitFor(() =>
            expect(pinTimeBlockModule.default).toHaveBeenCalledWith(task.id)
        );
    });

    it('removes the task from the source list on success', async () => {
        pinTimeBlockModule.default.mockResolvedValue({});
        const setSourceTasks = vi.fn();
        handlePinTask(task, setSourceTasks, vi.fn());
        await vi.waitFor(() => expect(setSourceTasks).toHaveBeenCalled());
        const filterFn = setSourceTasks.mock.calls[0][0];
        expect(filterFn([{ id: 1 }, { id: 2 }])).toEqual([{ id: 2 }]);
    });

    it('adds the task to pinnedTasks with pinned: true and pinned_at set to now', async () => {
        pinTimeBlockModule.default.mockResolvedValue({});
        const setPinnedTasks = vi.fn();
        handlePinTask(task, vi.fn(), setPinnedTasks);
        await vi.waitFor(() => expect(setPinnedTasks).toHaveBeenCalled());
        const updateFn = setPinnedTasks.mock.calls[0][0];
        const result = updateFn([]);
        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
            ...task,
            pinned: true,
            pinned_at: expect.stringMatching(/^2026-04-07T12:/),
        });
    });

    it('prepends the pinned task to the front of the pinned list', async () => {
        pinTimeBlockModule.default.mockResolvedValue({});
        const setPinnedTasks = vi.fn();
        handlePinTask(task, vi.fn(), setPinnedTasks);
        await vi.waitFor(() => expect(setPinnedTasks).toHaveBeenCalled());
        const updateFn = setPinnedTasks.mock.calls[0][0];
        const existing = [{ id: 2, pinned: true }];
        const result = updateFn(existing);
        expect(result[0]).toMatchObject({ id: 1, pinned: true });
        expect(result[1]).toBe(existing[0]);
    });

    it('does not call setSourceTasks or setPinnedTasks when the API call fails', async () => {
        pinTimeBlockModule.default.mockRejectedValue(new Error('Network error'));
        const setSourceTasks = vi.fn();
        const setPinnedTasks = vi.fn();
        handlePinTask(task, setSourceTasks, setPinnedTasks);
        await vi.waitFor(() =>
            expect(pinTimeBlockModule.default).toHaveBeenCalledWith(task.id)
        );
        expect(setSourceTasks).not.toHaveBeenCalled();
        expect(setPinnedTasks).not.toHaveBeenCalled();
    });
});
