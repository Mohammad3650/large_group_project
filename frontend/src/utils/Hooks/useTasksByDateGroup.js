import { useEffect, useState } from 'react';
import groupTasksByTaskGroup from '../Helpers/groupTasksByTaskGroup.js';
import sumTotalTasks from '../Helpers/sumTotalTasks.js';

/**
 * Groups an array of time blocks into date-based categories for display on the dashboard.
 * Categories are: overdue, today, tomorrow, next 7 days, after next 7 days, and completed.
 * Each category other than completed is sorted in ascending order of datetime,
 * whereas completed is sorted in descending order of completion.
 *
 * @param {Array|null} blocks - Array of time block objects to group, or null if not yet loaded
 * @returns {{
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
    const [overdueTasks, setOverdueTasks] = useState([]);
    const [todayTasks, setTodayTasks] = useState([]);
    const [tomorrowTasks, setTomorrowTasks] = useState([]);
    const [weekTasks, setWeekTasks] = useState([]);
    const [beyondWeekTasks, setBeyondWeekTasks] = useState([]);
    const [completedTasks, setCompletedTasks] = useState([]);

    useEffect(() => {
        if (blocks === null) return;
        const groupedTasks = groupTasksByTaskGroup(blocks);
        setOverdueTasks(groupedTasks.overdueTasks);
        setTodayTasks(groupedTasks.todayTasks);
        setTomorrowTasks(groupedTasks.tomorrowTasks);
        setWeekTasks(groupedTasks.weekTasks);
        setBeyondWeekTasks(groupedTasks.beyondWeekTasks);
        setCompletedTasks(groupedTasks.completedTasks);
    }, [blocks]);

    const totalTasks = sumTotalTasks({ overdueTasks, todayTasks, tomorrowTasks, weekTasks, beyondWeekTasks, completedTasks });

    return {
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