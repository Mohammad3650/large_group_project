import getNoSearchResults from '../../utils/Helpers/getNoSearchResults.js';
import './stylesheets/NoTasksMessage.css';

/**
 * Displays a contextual message when no tasks are visible.
 * Shows a congratulatory message when the user has no tasks at all,
 * or a "no results" message when a search yields no matches.
 *
 * @param {Object} props
 * @param {number} props.totalTasks - Total number of tasks across all groups
 * @param {Object} props.filteredTasks - Object containing all filtered task arrays
 * @param {string} props.searchTerm - The current search query
 * @returns {React.JSX.Element|null} The message, or null if no message is needed
 */
function NoTasksMessage({ totalTasks, filteredTasks, searchTerm }) {
    if (totalTasks === 0) return <p className="no-tasks-message">🎉 Congrats, you have no tasks!</p>;
    if (getNoSearchResults(filteredTasks, searchTerm)) return <p className="no-tasks-message">No tasks found matching "{searchTerm.trim()}"</p>;
    return null;
}

export default NoTasksMessage;
