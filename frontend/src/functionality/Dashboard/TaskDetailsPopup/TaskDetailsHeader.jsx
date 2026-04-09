import { FaTimes } from 'react-icons/fa';
import '../stylesheets/TaskDetailsPopup/TaskDetailsHeader.css';

/**
 * Renders the header of the task details popup with the task name and close button.
 *
 * @param {Object} props
 * @param {string} props.name - The task name
 * @param {Function} props.onClose - Callback to close the popup
 * @returns {JSX.Element} The popup header with title and close button
 */
function TaskDetailsHeader({ name, onClose }) {
    return (
        <div className="task-details-header">
            <h3 className="task-details-title">{name}</h3>
            <button className="task-details-close" onClick={onClose}>
                <FaTimes />
            </button>
        </div>
    );
}

export default TaskDetailsHeader;