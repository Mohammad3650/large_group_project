import { useState } from "react";
import "./Task.css";

function Task(props) {
    const [checked, setChecked] = useState(false);
    const [fading, setFading] = useState(false);

    const ding = new Audio("/ding.mp3");
    ding.volume = 0.3;

    function formatDatetime(datetime) {
        const date = new Date(datetime);
        const time = date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
        const day = date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
        return `${time} ${day}`;
    }

    function handleClick() {
        if (checked) return;
        ding.play().catch(err => console.error("Audio failed:", err));
        setChecked(true);
        setFading(true);
        setTimeout(() => props.onDelete(), 500);
    }

    return (
        <div className={`form-check task-item ${checked ? "checked" : ""} ${fading ? "fading" : ""}`} onClick={handleClick}>
            <input className="form-check-input" type="checkbox" readOnly checked={checked} />
            <label className="form-check-label">{props.name}</label>
            <span className="task-datetime">{formatDatetime(props.datetime)}</span>
        </div>
    );
}

export default Task;