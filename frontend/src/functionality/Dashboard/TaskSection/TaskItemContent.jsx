import formatDateTime from '../utils/Formatters/formatDateTime.js';
import '../stylesheets/TaskSection/TaskItemContent.css';

/**
 * Displays the content of a task item including the checkbox, name, and datetime.
 *
 * @param {Object} props
 * @param {string} props.name - The task name
 * @param {string} props.date - Date string (e.g. "2026-02-19")
 * @param {string} props.startTime - Start time string (e.g. "09:00:00")
 * @param {string} props.endTime - End time string (e.g. "10:00:00")
 * @param {boolean} props.checked - Whether the checkbox is checked
 * @param {boolean} props.fading - Whether the task is fading out
 * @param {boolean} [props.overdue=false] - Whether the task is overdue
 * @param {boolean} [props.completed=false] - Whether the task is completed
 * @param {Function} props.onClick - Callback when the task is clicked
 * @returns {React.JSX.Element} The task item content
 */
function TaskItemContent({ name, date, startTime, endTime, checked, fading, overdue = false, completed = false, onClick }) {
    return (
        <div
            className={`form-check task-item ${checked ? 'checked' : ''} ${fading ? 'fading' : ''}`}
            onClick={onClick}
        >
            <input
                className="form-check-input"
                type="checkbox"
                readOnly
                checked={checked}
            />
            <label className={`form-check-label ${overdue ? 'overdue-text' : ''} ${completed ? 'completed-text' : ''}`}>
                {name}
            </label>
            <span className="task-datetime">
                {formatDateTime(date, startTime, endTime)}
            </span>
        </div>
    );
}

export default TaskItemContent;