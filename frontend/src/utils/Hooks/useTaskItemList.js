import getDate from '../Helpers/getDate.js';
import getDateBoundaries from '../Helpers/getDateBoundaries.js';

/**
 * Derives per-task overdue and completed flags for a task group.
 *
 * @param {boolean} overdue - Whether the group is an overdue group
 * @param {boolean} completed - Whether the group is a completed group
 * @returns {Object} getTaskFlags - Function that returns taskCompleted and taskOverdue for a task
 */
function useTaskItemList(overdue, completed) {
    const { today } = getDateBoundaries();

    function getTaskFlags(task) {
        const taskCompleted = completed || !!task.completed_at;
        const taskOverdue = overdue || (!task.completed_at && getDate(task) < today);
        return { taskCompleted, taskOverdue };
    }

    return { getTaskFlags };
}

export default useTaskItemList;
