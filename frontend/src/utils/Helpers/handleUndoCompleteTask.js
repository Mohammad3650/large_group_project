import undoCompleteTimeBlock from '../Api/undoCompleteTimeBlock.js';
import getDateBoundaries from './getDateBoundaries.js';
import getDate from './getDate.js';
import sortTasksByDate from './sortTasksByDate.js';

/**
 * Undoes the completion of a task by calling the API
 * and restores it to the appropriate date-group task list.
 *
 * @param {Object} task - The completed task to restore
 * @param {Object} setters - State setter functions for each task group
 * @param {Function} setters.setCompletedTasks - Setter for completed tasks
 * @param {Function} setters.setOverdueTasks - Setter for overdue tasks
 * @param {Function} setters.setTodayTasks - Setter for today's tasks
 * @param {Function} setters.setTomorrowTasks - Setter for tomorrow's tasks
 * @param {Function} setters.setWeekTasks - Setter for next 7 days' tasks
 * @param {Function} setters.setBeyondWeekTasks - Setter for tasks beyond next 7 days
 */
function handleUndoCompleteTask(task, { setCompletedTasks, setOverdueTasks, setTodayTasks, setTomorrowTasks, setWeekTasks, setBeyondWeekTasks }) {
    undoCompleteTimeBlock(task.id)
        .then(() => {
            setCompletedTasks((prev) => prev.filter((item) => item.id !== task.id));
            const { today, tomorrow, dayAfterTomorrow, weekEnd } = getDateBoundaries();
            const taskDate = getDate(task);
            const restoredTask = { ...task, completed_at: null };

            const lookup = [
                { condition: taskDate < today, setter: setOverdueTasks },
                { condition: taskDate < tomorrow, setter: setTodayTasks },
                { condition: taskDate < dayAfterTomorrow, setter: setTomorrowTasks },
                { condition: taskDate <= weekEnd, setter: setWeekTasks },
            ];

            const match = lookup.find(({ condition }) => condition);
            const setter = match ? match.setter : setBeyondWeekTasks;
            setter((prev) => [...prev, restoredTask].sort(sortTasksByDate));
        })
        .catch(() => {});
}

export default handleUndoCompleteTask;
