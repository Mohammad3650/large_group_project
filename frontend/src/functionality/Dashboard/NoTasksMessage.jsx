import './stylesheets/NoTasksMessage.css';

/**
 * Displays a contextual message when no tasks are visible.
 * Shows a congratulatory message when the user has no tasks at all,
 * or a "no results" message when a search yields no matches.
 *
 * @param {Object} props
 * @param {number} props.totalTasks - Total number of tasks across all groups
 * @param {Array} props.filteredOverdue - Filtered overdue tasks
 * @param {Array} props.filteredToday - Filtered today's tasks
 * @param {Array} props.filteredTomorrow - Filtered tomorrow's tasks
 * @param {Array} props.filteredWeek - Filtered next 7 days' tasks
 * @param {Array} props.filteredBeyondWeek - Filtered tasks beyond next 7 days
 * @param {Array} props.filteredCompleted - Filtered completed tasks
 * @param {string} props.searchTerm - The current search query
 * @returns {JSX.Element|null} The message, or null if no message is needed
 */
function NoTasksMessage({ totalTasks, filteredOverdue, filteredToday, filteredTomorrow, filteredWeek, filteredBeyondWeek, filteredCompleted, searchTerm }) {
    if (totalTasks === 0) return <p className="no-tasks-message">🎉 Congrats, you have no tasks!</p>;

    const foundNoResults =
        filteredOverdue.length === 0 &&
        filteredToday.length === 0 &&
        filteredTomorrow.length === 0 &&
        filteredWeek.length === 0 &&
        filteredBeyondWeek.length === 0 &&
        filteredCompleted.length === 0 &&
        searchTerm.trim() !== '';

    if (foundNoResults) return <p className="no-tasks-message">No tasks found matching "{searchTerm.trim()}"</p>;

    return null;
}

export default NoTasksMessage;
