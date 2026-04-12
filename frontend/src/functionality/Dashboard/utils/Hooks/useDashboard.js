import { useState } from 'react';
import useTimeBlocks from '../../../../utils/Hooks/useTimeBlocks.js';
import useTasksByDateGroup from './useTasksByDateGroup.js';
import useUsername from '../../../../utils/Hooks/useUsername.js';
import useFilterTasksForSearch from './useFilterTasksForSearch.js';
import buildTaskGroups from '../Helpers/buildTaskGroups.js';

/**
 * Manages all data fetching and state for the Dashboard page.
 *
 * @returns {Object} Dashboard data and state including error, username,
 * search state, task groups, total tasks, and filtered tasks.
 */
function useDashboard() {
    const [searchTerm, setSearchTerm] = useState('');

    const { blocks, error: blocksError } = useTimeBlocks();

    const {
        pinnedTasks, setPinnedTasks,
        overdueTasks, setOverdueTasks,
        todayTasks, setTodayTasks,
        tomorrowTasks, setTomorrowTasks,
        weekTasks, setWeekTasks,
        beyondWeekTasks, setBeyondWeekTasks,
        completedTasks, setCompletedTasks,
        totalTasks,
    } = useTasksByDateGroup(blocks);

    const { username } = useUsername(true);

    const { filteredTasks } = useFilterTasksForSearch(
        { pinnedTasks, overdueTasks, todayTasks, tomorrowTasks, weekTasks, beyondWeekTasks, completedTasks },
        searchTerm
    );

    const setters = { setPinnedTasks, setOverdueTasks, setTodayTasks, setTomorrowTasks, setWeekTasks, setBeyondWeekTasks, setCompletedTasks };
    const taskGroups = buildTaskGroups(filteredTasks, setters);

    return {
        blocksError,
        username,
        searchTerm,
        setSearchTerm,
        taskGroups,
        totalTasks,
        filteredTasks,
    };
}

export default useDashboard;
