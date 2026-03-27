import { useState } from 'react';
import './stylesheets/TaskItem.css';
import formatDateTime from '../../utils/formatDateTime.js';
import playDing from '../../utils/playDing.js';

/**
 * Displays a single task item with a checkbox, name, start time and end time.
 * Plays a ding sound and fades out on click before deleting.
 *
 * @param {string} props.name - The task name
 * @param {string} props.date - Date string (e.g. "2026-02-19")
 * @param {string} props.startTime - Start time string (e.g. "09:00:00")
 * @param {string} props.endTime - End time string (e.g. "10:00:00")
 * @param {Function} props.onDelete - Callback to the handleDelete function from the TaskGroup component
 * @param {boolean} [props.overdue=false] - Whether the task is overdue
 * @returns {JSX.Element} A single task
 */
function TaskItem(props) {
    const [checked, setChecked] = useState(false);
    const [fading, setFading] = useState(false);

    function handleClick() {
        if (checked) return;
        playDing();
        setChecked(true);
        setFading(true);
        setTimeout(() => props.onDelete(), 500);
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
                className={`form-check-label ${props.overdue ? 'overdue-text' : ''}`}
            >
                {props.name}
            </label>
            <span className="task-datetime">
                {formatDateTime(props.date, props.startTime, props.endTime)}
            </span>
        </div>
    );
}

export default TaskItem;
