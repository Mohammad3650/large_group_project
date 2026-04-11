import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import useTasksByDateGroup from '../../../utils/Hooks/useTasksByDateGroup.js';

vi.mock('../../../utils/Helpers/groupTasksByDateGroup.js', () => ({ default: vi.fn() }));
vi.mock('../../../utils/Helpers/sumTotalTasks.js', () => ({ default: vi.fn() }));

import * as groupTasksByDateGroupModule from '../../../utils/Helpers/groupTasksByDateGroup.js';
import * as sumTotalTasksModule from '../../../utils/Helpers/sumTotalTasks.js';

const emptyGrouped = {
    pinnedTasks: [], overdueTasks: [], todayTasks: [], tomorrowTasks: [],
    weekTasks: [], beyondWeekTasks: [], completedTasks: [],
};

describe('useTasksByDateGroup', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        groupTasksByDateGroupModule.default.mockReturnValue(emptyGrouped);
        sumTotalTasksModule.default.mockReturnValue(0);
    });

    it('initialises all 7 task arrays as empty', () => {
        const { result } = renderHook(() => useTasksByDateGroup(null));
        expect(result.current.pinnedTasks).toEqual([]);
        expect(result.current.overdueTasks).toEqual([]);
        expect(result.current.todayTasks).toEqual([]);
        expect(result.current.tomorrowTasks).toEqual([]);
        expect(result.current.weekTasks).toEqual([]);
        expect(result.current.beyondWeekTasks).toEqual([]);
        expect(result.current.completedTasks).toEqual([]);
    });

    it('exposes a setter function for each task array', () => {
        const { result } = renderHook(() => useTasksByDateGroup(null));
        expect(typeof result.current.setPinnedTasks).toBe('function');
        expect(typeof result.current.setOverdueTasks).toBe('function');
        expect(typeof result.current.setTodayTasks).toBe('function');
        expect(typeof result.current.setTomorrowTasks).toBe('function');
        expect(typeof result.current.setWeekTasks).toBe('function');
        expect(typeof result.current.setBeyondWeekTasks).toBe('function');
        expect(typeof result.current.setCompletedTasks).toBe('function');
    });

    it('does not call groupTasksByDateGroup when blocks is null', () => {
        renderHook(() => useTasksByDateGroup(null));
        expect(groupTasksByDateGroupModule.default).not.toHaveBeenCalled();
    });

    it('calls groupTasksByDateGroup with blocks when blocks is an array', async () => {
        const blocks = [{ id: 1 }];
        renderHook(() => useTasksByDateGroup(blocks));
        await waitFor(() =>
            expect(groupTasksByDateGroupModule.default).toHaveBeenCalledWith(blocks)
        );
    });

    it('sets all 7 task arrays from the result of groupTasksByDateGroup', async () => {
        const grouped = {
            pinnedTasks: [{ id: 1 }],
            overdueTasks: [{ id: 2 }],
            todayTasks: [{ id: 3 }],
            tomorrowTasks: [{ id: 4 }],
            weekTasks: [{ id: 5 }],
            beyondWeekTasks: [{ id: 6 }],
            completedTasks: [{ id: 7 }],
        };
        groupTasksByDateGroupModule.default.mockReturnValue(grouped);
        const { result } = renderHook(() => useTasksByDateGroup([{ id: 1 }]));
        await waitFor(() => expect(result.current.pinnedTasks).toEqual([{ id: 1 }]));
        expect(result.current.overdueTasks).toEqual([{ id: 2 }]);
        expect(result.current.todayTasks).toEqual([{ id: 3 }]);
        expect(result.current.tomorrowTasks).toEqual([{ id: 4 }]);
        expect(result.current.weekTasks).toEqual([{ id: 5 }]);
        expect(result.current.beyondWeekTasks).toEqual([{ id: 6 }]);
        expect(result.current.completedTasks).toEqual([{ id: 7 }]);
    });

    it('updates task arrays when blocks change', async () => {
        const grouped1 = { ...emptyGrouped, todayTasks: [{ id: 1 }] };
        const grouped2 = { ...emptyGrouped, overdueTasks: [{ id: 2 }] };
        groupTasksByDateGroupModule.default
            .mockReturnValueOnce(grouped1)
            .mockReturnValueOnce(grouped2);
        const { result, rerender } = renderHook(
            ({ blocks }) => useTasksByDateGroup(blocks),
            { initialProps: { blocks: [{ id: 1 }] } }
        );
        await waitFor(() => expect(result.current.todayTasks).toEqual([{ id: 1 }]));
        rerender({ blocks: [{ id: 2 }] });
        await waitFor(() => expect(result.current.overdueTasks).toEqual([{ id: 2 }]));
    });

    it('returns totalTasks from sumTotalTasks', () => {
        sumTotalTasksModule.default.mockReturnValue(5);
        const { result } = renderHook(() => useTasksByDateGroup(null));
        expect(result.current.totalTasks).toBe(5);
    });

    it('allows individual task arrays to be updated via their setters', () => {
        const { result } = renderHook(() => useTasksByDateGroup(null));
        act(() => result.current.setPinnedTasks([{ id: 99 }]));
        expect(result.current.pinnedTasks).toEqual([{ id: 99 }]);
    });
});