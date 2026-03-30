import { useEffect, useState } from 'react';
import getDate from './getDate.js';
import sortTasksByDate from './sortTasksByDate.js';

/**
 * Groups an array of time blocks into date-based categories for display on the dashboard.
 * Categories are: overdue, today, tomorrow, next 7 days, and after next 7 days.
 * Each category is sorted in ascending order of datetime.
 * @param {Array|null} blocks - Array of time block objects to group, or null if not yet loaded
 * @returns {{
 *   overdueTasks: Array, setOverdueTasks: Function,
 *   todayTasks: Array, setTodayTasks: Function,
 *   tomorrowTasks: Array, setTomorrowTasks: Function,
 *   weekTasks: Array, setWeekTasks: Function,
 *   beyondWeekTasks: Array, setBeyondWeekTasks: Function,
 *   totalTasks: number
 * }} The grouped task arrays, their setters, and the total task count
 */
function useTasksByDateGroup(blocks) {
    const [overdueTasks, setOverdueTasks] = useState([]);
    const [todayTasks, setTodayTasks] = useState([]);
    const [tomorrowTasks, setTomorrowTasks] = useState([]);
    const [weekTasks, setWeekTasks] = useState([]);
    const [beyondWeekTasks, setBeyondWeekTasks] = useState([]);

    useEffect(() => {
        if (blocks === null) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const dayAfterTomorrow = new Date(today);
        dayAfterTomorrow.setDate(today.getDate() + 2);
        const weekEnd = new Date(today);
        weekEnd.setDate(today.getDate() + 7);

        const blocksWithDates = blocks.map((block) => ({ block, date: getDate(block) }));

        const filterAndSortByDate = (predicate) =>
            blocksWithDates
                .filter(({ date }) => predicate(date))
                .map(({ block }) => block)
                .sort(sortTasksByDate);

        setOverdueTasks(filterAndSortByDate((date) => date < today));
        setTodayTasks(filterAndSortByDate((date) => date >= today && date < tomorrow));
        setTomorrowTasks(filterAndSortByDate((date) => date >= tomorrow && date < dayAfterTomorrow));
        setWeekTasks(filterAndSortByDate((date) => date >= dayAfterTomorrow && date <= weekEnd));
        setBeyondWeekTasks(filterAndSortByDate((date) => date > weekEnd));
    }, [blocks]);

    const totalTasks =
        overdueTasks.length +
        todayTasks.length +
        tomorrowTasks.length +
        weekTasks.length +
        beyondWeekTasks.length;

    return {
        overdueTasks,
        setOverdueTasks,
        todayTasks,
        setTodayTasks,
        tomorrowTasks,
        setTomorrowTasks,
        weekTasks,
        setWeekTasks,
        beyondWeekTasks,
        setBeyondWeekTasks,
        totalTasks
    };
}

export default useTasksByDateGroup;