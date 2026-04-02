import { useEffect, useState } from 'react';
import getDate from '../Helpers/getDate.js';
import getDateBoundaries from '../Helpers/getDateBoundaries.js';
import filterTasksAndSortByDate from '../Helpers/filterTasksAndSortByDate.js';
import sortTasksByCompletedAt from '../Helpers/sortTasksByCompletedAt.js';

/**
 * Groups an array of time blocks into date-based categories for display on the dashboard.
 * Categories are: overdue, today, tomorrow, next 7 days, after next 7 days, and completed.
 * Each pending category is sorted in ascending order of datetime.
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
 * }} The grouped task arrays, their setters, and the total pending task count
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

        const { today, tomorrow, dayAfterTomorrow, weekEnd } = getDateBoundaries();
        const pendingBlocks = blocks.filter((block) => !block.completed_at);
        const blocksWithDates = pendingBlocks.map((block) => ({ block, date: getDate(block) }));

        setOverdueTasks(filterTasksAndSortByDate(blocksWithDates, (date) => date < today));
        setTodayTasks(filterTasksAndSortByDate(blocksWithDates, (date) => date >= today && date < tomorrow));
        setTomorrowTasks(filterTasksAndSortByDate(blocksWithDates, (date) => date >= tomorrow && date < dayAfterTomorrow));
        setWeekTasks(filterTasksAndSortByDate(blocksWithDates, (date) => date >= dayAfterTomorrow && date <= weekEnd));
        setBeyondWeekTasks(filterTasksAndSortByDate(blocksWithDates, (date) => date > weekEnd));
        // want to sort completed tasks by order of completion (descending) rather than date time
        setCompletedTasks(blocks.filter((block) => block.completed_at).sort(sortTasksByCompletedAt));
    }, [blocks]);

    const totalTasks =
        overdueTasks.length +
        todayTasks.length +
        tomorrowTasks.length +
        weekTasks.length +
        beyondWeekTasks.length +
        completedTasks.length;

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
