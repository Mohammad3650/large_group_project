import { FaClock, FaMapMarkerAlt, FaTag, FaAlignLeft, FaTimes } from 'react-icons/fa';
import formatDateTime from '../../utils/Formatters/formatDateTime.js';
import './stylesheets/TaskDetailsPopup.css';

/**
 * Modal popup displaying the full details of a task.
 * Dismissible by clicking the backdrop or the close button.
 *
 * @param {Object} props
 * @param {Object} props.task - The task to display
 * @param {Function} props.onClose - Callback to close the popup
 * @returns {JSX.Element} The task details popup
 */
function TaskDetailsPopup({ task, onClose }) {
    return (
        <div className="task-details-overlay" onClick={onClose}>
            <div className="task-details-popup" onClick={(e) => e.stopPropagation()}>
                <div className="task-details-header">
                    <h3 className="task-details-title">{task.name}</h3>
                    <button className="task-details-close" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <div className="task-details-body">
                    <div className="task-details-row">
                        <FaClock className="task-details-icon" />
                        <span>{formatDateTime(task.date, task.startTime, task.endTime)}</span>
                    </div>
                    <div className="task-details-row">
                        <FaMapMarkerAlt className="task-details-icon" />
                        <span>{task.location || 'No location'}</span>
                    </div>
                    <div className="task-details-row">
                        <FaTag className="task-details-icon" />
                        <span>{task.blockType || 'N/A'}</span>
                    </div>
                    <div className="task-details-row">
                        <FaAlignLeft className="task-details-icon" />
                        <span>{task.description || 'No description'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TaskDetailsPopup;
