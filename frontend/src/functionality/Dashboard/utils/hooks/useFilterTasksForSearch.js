import { useMemo } from 'react';
import filterTasksForSearch from '../helpers/filterTasksForSearch.js';

/**
 * Filters all task groups by a search term using the useMemo hook.
 *
 * @param {Object} taskGroups - The task group arrays to filter
 * @param {Array} taskGroups.pinnedTasks - Pinned tasks
 * @param {Array} taskGroups.overdueTasks - Overdue tasks
 * @param {Array} taskGroups.todayTasks - Today's tasks
 * @param {Array} taskGroups.tomorrowTasks - Tomorrow's tasks
 * @param {Array} taskGroups.weekTasks - Next 7 days' tasks
 * @param {Array} taskGroups.beyondWeekTasks - Tasks beyond next 7 days
 * @param {Array} taskGroups.completedTasks - Completed tasks
 * @param {string} searchTerm - The current search query
 * @returns {{
 *   filteredTasks: {
 *     filteredPinned: Array,
 *     filteredOverdue: Array,
 *     filteredToday: Array,
 *     filteredTomorrow: Array,
 *     filteredWeek: Array,
 *     filteredBeyondWeek: Array,
 *     filteredCompleted: Array
 *   }
 * }}
 */
function buildFilteredTasks(taskGroups, searchTerm) {
    return {
        filteredPinned: filterTasksForSearch(taskGroups.pinnedTasks, searchTerm),
        filteredOverdue: filterTasksForSearch(taskGroups.overdueTasks, searchTerm),
        filteredToday: filterTasksForSearch(taskGroups.todayTasks, searchTerm),
        filteredTomorrow: filterTasksForSearch(taskGroups.tomorrowTasks, searchTerm),
        filteredWeek: filterTasksForSearch(taskGroups.weekTasks, searchTerm),
        filteredBeyondWeek: filterTasksForSearch(taskGroups.beyondWeekTasks, searchTerm),
        filteredCompleted: filterTasksForSearch(taskGroups.completedTasks, searchTerm)
    };
}

function useFilterTasksForSearch(
    {
        pinnedTasks,
        overdueTasks,
        todayTasks,
        tomorrowTasks,
        weekTasks,
        beyondWeekTasks,
        completedTasks
    },
    searchTerm
) {
    const filteredTasks = useMemo(() => {
        return buildFilteredTasks(
            {
                pinnedTasks,
                overdueTasks,
                todayTasks,
                tomorrowTasks,
                weekTasks,
                beyondWeekTasks,
                completedTasks
            },
            searchTerm
        );
    }, [
        pinnedTasks,
        overdueTasks,
        todayTasks,
        tomorrowTasks,
        weekTasks,
        beyondWeekTasks,
        completedTasks,
        searchTerm
    ]);

    return { filteredTasks };
}

export default useFilterTasksForSearch;
