import getTitleClass from '../../../utils/Helpers/getTitleClass.js';
import '../stylesheets/TaskSection/TaskGroupHeader.css';

/**
 * Renders the clickable header for a collapsible task group.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the group is expanded
 * @param {Function} props.onToggle - Callback to toggle open/closed state
 * @param {string} props.title - The group heading
 * @param {string} props.variant - CSS variant for title colour
 * @param {number} props.taskCount - Number of tasks in the group
 * @returns {React.JSX.Element} The clickable task group header
 */
function TaskGroupHeader({ isOpen, onToggle, title, variant, taskCount }) {
    return (
        <div className="task-group" data-testid="task-group-header" onClick={onToggle}>
            <span className={`arrow ${isOpen ? 'open' : 'closed'}`}>^</span>
            <h5 className={getTitleClass(variant)}>{title}</h5>
            <h5 className="number-of-tasks">({taskCount})</h5>
        </div>
    );
}

export default TaskGroupHeader;
