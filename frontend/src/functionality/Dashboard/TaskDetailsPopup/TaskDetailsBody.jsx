import { FaClock, FaMapMarkerAlt, FaTag, FaAlignLeft } from 'react-icons/fa';
import formatDateTime from '../../../utils/Formatters/formatDateTime.js';
import '../stylesheets/TaskDetailsPopup/TaskDetailsBody.css';

/**
 * Renders the detail rows of the task details popup.
 *
 * @param {Object} props
 * @param {Object} props.task - The task to display
 */
function TaskDetailsBody({ task }) {
    return (
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
    );
}

export default TaskDetailsBody;
