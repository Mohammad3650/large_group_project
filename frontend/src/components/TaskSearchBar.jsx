import { FaSearch } from 'react-icons/fa';
import './stylesheets/TaskSearchBar.css';

/**
 * Search bar component for filtering tasks by name.
 *
 * @param {string} searchTerm - The current search term
 * @param {Function} setSearchTerm - Setter to update the search term
 * @returns {JSX.Element} A search bar with a non-interactive search icon
 */
function TaskSearchBar({ searchTerm, setSearchTerm }) {
    return (
        <div className="task-search-wrapper">
            <FaSearch className="task-search-icon" />
            <input
                type="text"
                className="task-search-input"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
    );
}

export default TaskSearchBar;