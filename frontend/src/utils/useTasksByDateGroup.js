import { useEffect, useState } from "react";
import getDate from "./getDate.js";
import sortTasksByDate from "./sortTasksByDate.js";


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

        setOverdueTasks(blocks.filter(b => getDate(b) < today).sort(sortTasksByDate));
        setTodayTasks(blocks.filter(b => getDate(b) >= today && getDate(b) < tomorrow).sort(sortTasksByDate));
        setTomorrowTasks(blocks.filter(b => getDate(b) >= tomorrow && getDate(b) < dayAfterTomorrow).sort(sortTasksByDate));
        setWeekTasks(blocks.filter(b => getDate(b) >= dayAfterTomorrow && getDate(b) <= weekEnd).sort(sortTasksByDate));
        setBeyondWeekTasks(blocks.filter(b => getDate(b) > weekEnd).sort(sortTasksByDate));
    }, [blocks]);

    const totalTasks = overdueTasks.length + todayTasks.length + tomorrowTasks.length + weekTasks.length + beyondWeekTasks.length;

    return {
        overdueTasks, setOverdueTasks,
        todayTasks, setTodayTasks,
        tomorrowTasks, setTomorrowTasks,
        weekTasks, setWeekTasks,
        beyondWeekTasks, setBeyondWeekTasks,
        totalTasks
    };
}

export default useTasksByDateGroup;