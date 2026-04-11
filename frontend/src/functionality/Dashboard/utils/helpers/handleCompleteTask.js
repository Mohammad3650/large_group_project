import completeTimeBlock from '../../../../utils/Api/completeTimeBlock.js';
import sortTasksByCompletedAt from '../../../../utils/Helpers/sortTasksByCompletedAt.js';

/**
 * Marks a task as complete by calling the API and updates
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
                [...prev, { ...task, completed_at: new Date().toISOString(), pinned: false, pinned_at: null }]
                    .sort(sortTasksByCompletedAt)
            );
        })
        .catch(() => {});
}

export default handleCompleteTask;
