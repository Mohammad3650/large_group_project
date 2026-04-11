import unpinTimeBlock from '../../../../utils/Api/unpinTimeBlock.js';
import restoreTaskToDateGroup from '../../../../utils/Helpers/restoreTaskToDateGroup.js';
import sortTasksByCompletedAt from '../../../../utils/Helpers/sortTasksByCompletedAt.js';

/**
 * Unpins a task by calling the API and restores it to the
 * appropriate date-group task list.
 *
 * @param {Object} task - The pinned task to restore
 * @param {Object} setters - State setter functions for each task group
 * @param {Function} setters.setPinnedTasks - Setter for pinned tasks
 * @param {Function} setters.setOverdueTasks - Setter for overdue tasks
 * @param {Function} setters.setTodayTasks - Setter for today's tasks
 * @param {Function} setters.setTomorrowTasks - Setter for tomorrow's tasks
 * @param {Function} setters.setWeekTasks - Setter for next 7 days' tasks
 * @param {Function} setters.setBeyondWeekTasks - Setter for tasks beyond next 7 days
 * @param {Function} setters.setCompletedTasks - Setter for completed tasks
 */
function handleUnpinTask(task, { setPinnedTasks, setOverdueTasks, setTodayTasks, setTomorrowTasks, setWeekTasks, setBeyondWeekTasks, setCompletedTasks }) {
    unpinTimeBlock(task.id)
        .then(() => {
            setPinnedTasks((prev) => prev.filter((item) => item.id !== task.id));
            if (task.completed_at) {
                setCompletedTasks((prev) => [...prev, { ...task, pinned: false, pinned_at: null }].sort(sortTasksByCompletedAt));
            } else {
                restoreTaskToDateGroup(
                    { ...task, pinned: false, pinned_at: null },
                    { setOverdueTasks, setTodayTasks, setTomorrowTasks, setWeekTasks, setBeyondWeekTasks }
                );
            }
        })
        .catch(() => {});
}

export default handleUnpinTask;