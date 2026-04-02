import completeTimeBlock from '../Api/completeTimeBlock.js';
import sortTasksByCompletedAt from './sortTasksByCompletedAt.js';

/**
 * Marks a task as complete by calling the API and optimistically updating
 * the source task group and the completed tasks list.
 *
 * @param {Object} task - The task to mark as complete
 * @param {Function} setSourceTasks - Setter for the task group the task belongs to
 * @param {Function} setCompletedTasks - Setter for the completed tasks list
 */
function handleCompleteTask(task, setSourceTasks, setCompletedTasks) {
    completeTimeBlock(task.id)
        .then(() => {
            setSourceTasks((prev) => prev.filter((item) => item.id !== task.id));
            setCompletedTasks((prev) =>
                [...prev, { ...task, completed_at: new Date().toISOString() }]
                    .sort(sortTasksByCompletedAt)
            );
        })
        .catch(() => {});
}

export default handleCompleteTask;
