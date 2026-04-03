/**
 * Filters a list of tasks by a search term, case-insensitively and ignoring leading/trailing whitespace.
 *
 * @param {Array} tasks - The list of tasks to filter
 * @param {string} searchTerm - The search term to filter by
 * @returns {Array} The filtered list of tasks
 */
function filterTasksForSearch(tasks, searchTerm) {
    const cleanedSearchTerm = searchTerm.trim().toLowerCase();
    if (!cleanedSearchTerm) return tasks;
    return tasks.filter((task) =>
        task.name.toLowerCase().includes(cleanedSearchTerm)
    );
}

export default filterTasksForSearch;
