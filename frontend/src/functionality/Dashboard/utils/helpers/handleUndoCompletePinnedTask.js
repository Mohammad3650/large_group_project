import undoCompleteTimeBlock from '../../../../utils/Api/undoCompleteTimeBlock.js';

/**
 * Undoes the completion of a pinned task by calling the API and clearing
 * its completed_at field in the pinned tasks list.
 * The task remains pinned after the undo.
 *
 * @param {Object} task - The pinned completed task
 * @param {Object} setters - State setter functions
 * @param {Function} setters.setPinnedTasks - Setter for pinned tasks
 */
function handleUndoCompletePinnedTask(task, { setPinnedTasks }) {
    undoCompleteTimeBlock(task.id)
        .then(() => {
            setPinnedTasks((prev) =>
                prev.map((item) => item.id === task.id ? { ...item, completed_at: null } : item)
            );
        })
        .catch(() => {});
}

export default handleUndoCompletePinnedTask;
