/**
 * Sums the total number of tasks across all date groups.
 *
 * @param {Array} overdueTasks - Overdue tasks
 * @param {Array} todayTasks - Today's tasks
 * @param {Array} tomorrowTasks - Tomorrow's tasks
 * @param {Array} weekTasks - Tasks in the next 7 days
 * @param {Array} beyondWeekTasks - Tasks beyond the next 7 days
 * @param {Array} completedTasks - Completed tasks
 * @returns {number} The total number of tasks
 */
function sumTotalTasks({ overdueTasks, todayTasks, tomorrowTasks, weekTasks, beyondWeekTasks, completedTasks }) {
    return overdueTasks.length + todayTasks.length + tomorrowTasks.length + weekTasks.length + beyondWeekTasks.length + completedTasks.length;
}

export default sumTotalTasks;