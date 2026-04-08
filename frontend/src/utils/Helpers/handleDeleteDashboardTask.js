import deleteTimeBlock from '../Api/deleteTimeBlock.js';

/**
 * Deletes a task by calling the API and removes it from the local state.
 *
 * @param {number} id - The ID of the task to delete
 * @param {Function} setTasks - State setter used to remove the deleted task from the list
 */
function handleDeleteDashboardTask(id, setTasks) {
    deleteTimeBlock(id)
        .then(() => setTasks((prev) => prev.filter((task) => task.id !== id)))
        .catch(() => {});
}

export default handleDeleteDashboardTask;