import formatDateTime from '../../utils/Formatters/formatDateTime.js';
import "./stylesheets/TaskItemContent.css"

/**
 * Displays the content of a task item including the checkbox, name, and datetime.
 *
 * @param {string} name - The task name
 * @param {string} date - Date string (e.g. "2026-02-19")
 * @param {string} startTime - Start time string (e.g. "09:00:00")
 * @param {string} endTime - End time string (e.g. "10:00:00")
 * @param {boolean} checked - Whether the checkbox is checked
 * @param {boolean} fading - Whether the task is fading out
 * @param {boolean} [overdue=false] - Whether the task is overdue
 * @param {boolean} [completed=false] - Whether the task is completed
 * @param {Function} onClick - Callback when the task is clicked
 * @returns {JSX.Element} The task item content
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