import { useEffect, useState } from 'react';
import groupTasksByDateGroup from '../Helpers/groupTasksByDateGroup.js';
import sumTotalTasks from '../Helpers/sumTotalTasks.js';

/**
 * Groups an array of time blocks into date-based categories for display on the dashboard.
 * Categories are: pinned, overdue, today, tomorrow, next 7 days, after next 7 days, and completed.
 * Pinned tasks are sorted by most recently pinned. Completed tasks are sorted by most recently
 * completed. All other categories are sorted in ascending datetime order.
 *
 * @param {Array|null} blocks - Array of time block objects to group, or null if not yet loaded
 * @returns {{
 *   pinnedTasks: Array, setPinnedTasks: Function,
 *   overdueTasks: Array, setOverdueTasks: Function,
 *   todayTasks: Array, setTodayTasks: Function,
 *   tomorrowTasks: Array, setTomorrowTasks: Function,
 *   weekTasks: Array, setWeekTasks: Function,
 *   beyondWeekTasks: Array, setBeyondWeekTasks: Function,
 *   completedTasks: Array, setCompletedTasks: Function,
 *   totalTasks: number
 * }} The grouped task arrays, their setters, and the total task count
 */
function useTasksByDateGroup(blocks) {
    const [pinnedTasks, setPinnedTasks] = useState([]);
    const [overdueTasks, setOverdueTasks] = useState([]);
    const [todayTasks, setTodayTasks] = useState([]);
    const [tomorrowTasks, setTomorrowTasks] = useState([]);
    const [weekTasks, setWeekTasks] = useState([]);
    const [beyondWeekTasks, setBeyondWeekTasks] = useState([]);
    const [completedTasks, setCompletedTasks] = useState([]);

    useEffect(() => {
        if (blocks === null) return;
        const grouped = groupTasksByDateGroup(blocks);
        setPinnedTasks(grouped.pinnedTasks);
        setOverdueTasks(grouped.overdueTasks);
        setTodayTasks(grouped.todayTasks);
        setTomorrowTasks(grouped.tomorrowTasks);
        setWeekTasks(grouped.weekTasks);
        setBeyondWeekTasks(grouped.beyondWeekTasks);
        setCompletedTasks(grouped.completedTasks);
    }, [blocks]);

    const totalTasks = sumTotalTasks({ pinnedTasks, overdueTasks, todayTasks, tomorrowTasks, weekTasks, beyondWeekTasks, completedTasks });

    return {
        pinnedTasks, setPinnedTasks,
        overdueTasks, setOverdueTasks,
        todayTasks, setTodayTasks,
        tomorrowTasks, setTomorrowTasks,
        weekTasks, setWeekTasks,
        beyondWeekTasks, setBeyondWeekTasks,
        completedTasks, setCompletedTasks,
        totalTasks,
    };
}

export default useTasksByDateGroup;