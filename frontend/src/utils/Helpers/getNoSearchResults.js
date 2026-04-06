/**
 * Determines whether a search query produced no matching tasks.
 *
 * Returns true only when all three conditions hold simultaneously:
 * at least one task exists in total, the search term is non-empty,
 * and every filtered group array is empty.
 *
 * @param {number} totalTasks - Total number of tasks across all groups
 * @param {string} searchTerm - The current search query entered by the user
 * @param {Array[]} filteredTaskArrays - One filtered task array per group
 * @returns {boolean} True if the search produced no results, false otherwise
 */
function getNoSearchResults(totalTasks, searchTerm, filteredTaskArrays) {
    return (
        totalTasks > 0 &&
        searchTerm.trim() !== '' &&
        filteredTaskArrays.every((group) => group.length === 0)
    );
}

export default getNoSearchResults;
