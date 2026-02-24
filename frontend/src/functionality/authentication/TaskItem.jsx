import { useState } from "react";
import "./TaskItem.css";

/**
 * Plays the ding sound when the user completes a task.
 * Creates a new Audio instance each time to allow overlapping playback.
 */
function playDing() {
    const ding = new Audio("/ding.mp3");
    ding.volume = 0.3;
    ding.play().catch(err => console.error("Audio failed:", err));
}

/**
 * Formats date and time strings into a human-readable format.
 *
 * @param {string} date - Date string (e.g. "2026-02-19")
 * @param {string} startTime - Start time string (e.g. "09:00:00")
 * @param {string} endTime - End time string (e.g. "10:00:00")
 * @returns {string} Formatted string (e.g. "09:00 - 10:00 19 Feb")
 */
function formatDatetime(date, startTime, endTime) {
    const dateObj = new Date(`${date}T${startTime}`);
    const endObj = new Date(`${date}T${endTime}`);
    const day = dateObj.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    const start = dateObj.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    const end = endObj.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    return `${start} - ${end} ${day}`;
}

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
        <div className={`form-check task-item ${checked ? "checked" : ""} ${fading ? "fading" : ""}`} onClick={handleClick}>
            <input className="form-check-input" type="checkbox" readOnly checked={checked} />
            <label className={`form-check-label ${props.overdue ? "overdue-text" : ""}`}>{props.name}</label>
            <span className="task-datetime">{formatDatetime(props.date, props.startTime, props.endTime)}</span>
        </div>
    );
}

export default TaskItem;