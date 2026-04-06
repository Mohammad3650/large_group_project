import { useMemo } from 'react';
import filterTasksForSearch from '../Helpers/filterTasksForSearch.js';

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
 *   filteredPinned: Array,
 *   filteredOverdue: Array,
 *   filteredToday: Array,
 *   filteredTomorrow: Array,
 *   filteredWeek: Array,
 *   filteredBeyondWeek: Array,
 *   filteredCompleted: Array
 * }}
 */
function useFilteredTasks({ pinnedTasks, overdueTasks, todayTasks, tomorrowTasks, weekTasks, beyondWeekTasks, completedTasks }, searchTerm) {
    const filteredPinned = useMemo(() => filterTasksForSearch(pinnedTasks, searchTerm), [pinnedTasks, searchTerm]);
    const filteredOverdue = useMemo(() => filterTasksForSearch(overdueTasks, searchTerm), [overdueTasks, searchTerm]);
    const filteredToday = useMemo(() => filterTasksForSearch(todayTasks, searchTerm), [todayTasks, searchTerm]);
    const filteredTomorrow = useMemo(() => filterTasksForSearch(tomorrowTasks, searchTerm), [tomorrowTasks, searchTerm]);
    const filteredWeek = useMemo(() => filterTasksForSearch(weekTasks, searchTerm), [weekTasks, searchTerm]);
    const filteredBeyondWeek = useMemo(() => filterTasksForSearch(beyondWeekTasks, searchTerm), [beyondWeekTasks, searchTerm]);
    const filteredCompleted = useMemo(() => filterTasksForSearch(completedTasks, searchTerm), [completedTasks, searchTerm]);

    return { filteredPinned, filteredOverdue, filteredToday, filteredTomorrow, filteredWeek, filteredBeyondWeek, filteredCompleted };
}

export default useFilteredTasks;
