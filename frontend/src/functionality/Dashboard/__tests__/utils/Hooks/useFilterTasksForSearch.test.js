import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import useFilterTasksForSearch from '../../../utils/Hooks/useFilterTasksForSearch.js';

vi.mock('../../../utils/Helpers/filterTasksForSearch.js', () => ({ default: vi.fn() }));

import * as filterTasksForSearchModule from '../../../utils/Helpers/filterTasksForSearch.js';

const emptyGroups = {
    pinnedTasks: [],
    overdueTasks: [],
    todayTasks: [],
    tomorrowTasks: [],
    weekTasks: [],
    beyondWeekTasks: [],
    completedTasks: [],
};

describe('useFilterTasksForSearch', () => {
    beforeEach(() => {
        filterTasksForSearchModule.default.mockImplementation((tasks) => tasks);
        vi.clearAllMocks();
    });

    it('returns a filteredTasks object with all seven keys', () => {
        filterTasksForSearchModule.default.mockImplementation((tasks) => tasks);
        const { result } = renderHook(() => useFilterTasksForSearch(emptyGroups, ''));
        expect(Object.keys(result.current.filteredTasks)).toEqual([
            'filteredPinned', 'filteredOverdue', 'filteredToday', 'filteredTomorrow',
            'filteredWeek', 'filteredBeyondWeek', 'filteredCompleted',
        ]);
    });

    it('calls filterTasksForSearch for each of the 7 task groups with the search term', () => {
        filterTasksForSearchModule.default.mockImplementation((tasks) => tasks);
        const groups = {
            pinnedTasks: [{ id: 1 }], overdueTasks: [{ id: 2 }], todayTasks: [{ id: 3 }],
            tomorrowTasks: [{ id: 4 }], weekTasks: [{ id: 5 }], beyondWeekTasks: [{ id: 6 }],
            completedTasks: [{ id: 7 }],
        };
        renderHook(() => useFilterTasksForSearch(groups, 'test'));
        expect(filterTasksForSearchModule.default).toHaveBeenCalledTimes(7);
        expect(filterTasksForSearchModule.default).toHaveBeenCalledWith([{ id: 1 }], 'test');
        expect(filterTasksForSearchModule.default).toHaveBeenCalledWith([{ id: 7 }], 'test');
    });

    it('returns filtered results from filterTasksForSearch', () => {
        const filtered = [{ id: 1 }];
        filterTasksForSearchModule.default.mockReturnValue(filtered);
        const { result } = renderHook(() => useFilterTasksForSearch({ ...emptyGroups, pinnedTasks: [{ id: 1 }] }, 'query'));
        expect(result.current.filteredTasks.filteredPinned).toBe(filtered);
    });

    it('recomputes filtered results when the search term changes', () => {
        filterTasksForSearchModule.default
            .mockReturnValueOnce([{ id: 1 }])
            .mockReturnValue([]);
        const { result, rerender } = renderHook(
            ({ term }) => useFilterTasksForSearch(emptyGroups, term),
            { initialProps: { term: 'a' } }
        );
        expect(result.current.filteredTasks.filteredPinned).toEqual([{ id: 1 }]);
        rerender({ term: 'b' });
        expect(result.current.filteredTasks.filteredPinned).toEqual([]);
    });
});
