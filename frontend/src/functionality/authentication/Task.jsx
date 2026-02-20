import { useState } from "react";
import "./Task.css";

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
 * Formats an ISO datetime string into a human-readable time and date.
 *
 * @param {string} datetime - ISO datetime string (e.g. "2026-02-19T09:00")
 * @returns {string} Formatted string (e.g. "09:00 19 Feb")
 */
function formatDatetime(datetime) {
    const date = new Date(datetime);
    const time = date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    const day = date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    return `${time} ${day}`;
}

/**
 * Displays a single task item with a checkbox, name, and datetime.
 * Plays a ding sound and fades out on click before deleting.
 *
 * @param {string} props.name - The task name
 * @param {string} props.datetime - ISO datetime string (e.g. "2026-02-19T09:00")
 * @param {Function} props.onDelete - Callback to the handleDelete function from the DaySection component
 * @param {boolean} [props.overdue=false] - Whether the task is overdue
 * @returns {JSX.Element} A single task
 */
function Task(props) {
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
            <span className="task-datetime">{formatDatetime(props.datetime)}</span>
        </div>
    );
}

export default Task;