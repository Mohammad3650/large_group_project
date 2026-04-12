import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useDashboard from '../../../utils/Hooks/useDashboard.js';

vi.mock('../../../../../utils/Hooks/useTimeBlocks.js', () => ({ default: vi.fn() }));
vi.mock('../../../utils/Hooks/useTasksByDateGroup.js', () => ({ default: vi.fn() }));
vi.mock('../../../../../utils/Hooks/useUsername.js', () => ({ default: vi.fn() }));
vi.mock('../../../utils/Hooks/useFilterTasksForSearch.js', () => ({ default: vi.fn() }));
vi.mock('../../../utils/Helpers/buildTaskGroups.js', () => ({ default: vi.fn() }));

import * as useTimeBlocksModule from '../../../../../utils/Hooks/useTimeBlocks.js';
import * as useTasksByDateGroupModule from '../../../utils/Hooks/useTasksByDateGroup.js';
import * as useUsernameModule from '../../../../../utils/Hooks/useUsername.js';
import * as useFilterTasksForSearchModule from '../../../utils/Hooks/useFilterTasksForSearch.js';
import * as buildTaskGroupsModule from '../../../utils/Helpers/buildTaskGroups.js';

const makeSetters = () => ({
    setPinnedTasks: vi.fn(), setOverdueTasks: vi.fn(), setTodayTasks: vi.fn(),
    setTomorrowTasks: vi.fn(), setWeekTasks: vi.fn(), setBeyondWeekTasks: vi.fn(),
    setCompletedTasks: vi.fn(),
});

const defaultDateGroup = {
    pinnedTasks: [], overdueTasks: [], todayTasks: [], tomorrowTasks: [],
    weekTasks: [], beyondWeekTasks: [], completedTasks: [], totalTasks: 0,
    ...makeSetters(),
};

const defaultFiltered = {
    filteredPinned: [], filteredOverdue: [], filteredToday: [], filteredTomorrow: [],
    filteredWeek: [], filteredBeyondWeek: [], filteredCompleted: [],
};

describe('useDashboard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useTimeBlocksModule.default.mockReturnValue({ blocks: [], error: null });
        useTasksByDateGroupModule.default.mockReturnValue(defaultDateGroup);
        useUsernameModule.default.mockReturnValue({ username: 'Alice' });
        useFilterTasksForSearchModule.default.mockReturnValue({ filteredTasks: defaultFiltered });
        buildTaskGroupsModule.default.mockReturnValue([]);
    });

    it('returns null blocksError when there is no error', () => {
        const { result } = renderHook(() => useDashboard());
        expect(result.current.blocksError).toBeNull();
    });

    it('returns blocksError from useTimeBlocks', () => {
        useTimeBlocksModule.default.mockReturnValue({ blocks: [], error: 'Some error' });
        const { result } = renderHook(() => useDashboard());
        expect(result.current.blocksError).toBe('Some error');
    });

    it('returns username from useUsername', () => {
        const { result } = renderHook(() => useDashboard());
        expect(result.current.username).toBe('Alice');
    });

    it('initialises searchTerm as an empty string', () => {
        const { result } = renderHook(() => useDashboard());
        expect(result.current.searchTerm).toBe('');
    });

    it('updates searchTerm when setSearchTerm is called', () => {
        const { result } = renderHook(() => useDashboard());
        act(() => result.current.setSearchTerm('hello'));
        expect(result.current.searchTerm).toBe('hello');
    });

    it('returns taskGroups from buildTaskGroups', () => {
        const mockGroups = [{ title: 'Pinned', tasks: [] }];
        buildTaskGroupsModule.default.mockReturnValue(mockGroups);
        const { result } = renderHook(() => useDashboard());
        expect(result.current.taskGroups).toBe(mockGroups);
    });

    it('returns totalTasks from useTasksByDateGroup', () => {
        useTasksByDateGroupModule.default.mockReturnValue({ ...defaultDateGroup, totalTasks: 5 });
        const { result } = renderHook(() => useDashboard());
        expect(result.current.totalTasks).toBe(5);
    });

    it('returns filteredTasks from useFilterTasksForSearch', () => {
        const mockFiltered = { ...defaultFiltered, filteredPinned: [{ id: 1 }] };
        useFilterTasksForSearchModule.default.mockReturnValue({ filteredTasks: mockFiltered });
        const { result } = renderHook(() => useDashboard());
        expect(result.current.filteredTasks).toBe(mockFiltered);
    });

    it('calls useUsername with true', () => {
        renderHook(() => useDashboard());
        expect(useUsernameModule.default).toHaveBeenCalledWith(true);
    });

    it('passes searchTerm to useFilterTasksForSearch', () => {
        const { result } = renderHook(() => useDashboard());
        act(() => result.current.setSearchTerm('react'));
        const lastCall = useFilterTasksForSearchModule.default.mock.calls.at(-1);
        expect(lastCall[1]).toBe('react');
    });
});
