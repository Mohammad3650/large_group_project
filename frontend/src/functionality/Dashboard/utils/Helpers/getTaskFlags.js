import getDate from './getDate.js';
import getDateBoundaries from './getDateBoundaries.js';

/**
 * Returns a function that derives overdue and completed flags for a task.
 *
 * @param {boolean} overdue - Whether the group is an overdue group
 * @param {boolean} completed - Whether the group is a completed group
 * @returns {Function} Function that returns taskCompleted and taskOverdue for a task
 */
function getTaskFlags(overdue, completed) {
    const { today } = getDateBoundaries();

    return function (task) {
        const taskCompleted = completed || !!task.completed_at;
        const taskOverdue = overdue || (!task.completed_at && getDate(task) < today);
        return { taskCompleted, taskOverdue };
    };
}

export default getTaskFlags;
