import pinTimeBlock from '../Api/pinTimeBlock.js';

/**
 * Pins a task by calling the API and moves it from its source
 * task group into the pinned tasks list.
 *
 * @param {Object} task - The task to pin
 * @param {Function} setSourceTasks - Setter for the task group the task belongs to
 * @param {Function} setPinnedTasks - Setter for the pinned tasks list
 */
function handlePinTask(task, setSourceTasks, setPinnedTasks) {
    pinTimeBlock(task.id)
        .then(() => {
            setSourceTasks((prev) => prev.filter((item) => item.id !== task.id));
            setPinnedTasks((prev) =>
                [{ ...task, pinned: true, pinned_at: new Date().toISOString() }, ...prev]
            );
        })
        .catch(() => {});
}

export default handlePinTask;