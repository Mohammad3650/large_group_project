/**
 * Determines whether a search query has returned no matching tasks.
 * Returns true only when every filtered task array is empty and the search term is non-empty.
 *
 * @param {Object} filteredTasks - Object containing all filtered task arrays
 * @param {string} searchTerm - The current search query
 * @returns {boolean} True if the search produced no results, false otherwise
 */
function getNoSearchResults(filteredTasks, searchTerm) {
    return (
        Object.values(filteredTasks).every((tasks) => tasks.length === 0) &&
        searchTerm.trim() !== ''
    );
}

export default getNoSearchResults;
