import { useState } from 'react';
import './stylesheets/TaskItem.css';
import formatDateTime from '../../utils/Formatters/formatDateTime.js';
import playDing from '../../utils/Audio/playDing.js';

/**
 * Displays a single task item with a checkbox, name, start time and end time.
 * Plays a ding sound and fades out on click before deleting.
 *
 * @param {string} name - The task name
 * @param {string} date - Date string (e.g. "2026-02-19")
 * @param {string} startTime - Start time string (e.g. "09:00:00")
 * @param {string} endTime - End time string (e.g. "10:00:00")
 * @param {Function} onDelete - Callback to the handleDelete function from the TaskGroup component
 * @param {boolean} [overdue=false] - Whether the task is overdue
 * @returns {JSX.Element} A single task
 */
function TaskItem({ name, date, startTime, endTime, onDelete, overdue = false }) {
    const [checked, setChecked] = useState(false);
    const [fading, setFading] = useState(false);

    function handleClick() {
        if (checked) return;
        playDing();
        setChecked(true);
        setFading(true);
        setTimeout(() => onDelete(), 500);
    }

    return (
        <div
            className={`form-check task-item ${checked ? 'checked' : ''} ${fading ? 'fading' : ''}`}
            onClick={handleClick}
        >
            <input
                className="form-check-input"
                type="checkbox"
                readOnly
                checked={checked}
            />
            <label
                className={`form-check-label ${overdue ? 'overdue-text' : ''}`}
            >
                {name}
            </label>
            <span className="task-datetime">
                {formatDateTime(date, startTime, endTime)}
            </span>
        </div>
    );
}

export default TaskItem;
