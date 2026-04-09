import TaskDetailsHeader from './TaskDetailsHeader.jsx';
import TaskDetailsBody from './TaskDetailsBody.jsx';
import '../stylesheets/TaskDetailsPopup/TaskDetailsPopup.css';

/**
 * Modal popup displaying the full details of a task.
 * Dismissible by clicking the backdrop or the close button.
 *
 * @param {Object} props
 * @param {Object} props.task - The task to display
 * @param {Function} props.onClose - Callback to close the popup
 * @returns {React.JSX.Element} The task details modal
 */
function TaskDetailsPopup({ task, onClose }) {
    return (
        <div className="task-details-overlay" onClick={onClose}>
            <div className="task-details-popup" onClick={(e) => e.stopPropagation()}>
                <TaskDetailsHeader name={task.name} onClose={onClose} />
                <TaskDetailsBody task={task} />
            </div>
        </div>
    );
}

export default TaskDetailsPopup;