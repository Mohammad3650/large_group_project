import TaskItem from "./TaskItem.jsx";
import { useState } from "react";
import "./TaskGroup.css"
import {api} from "../../api.js";

/**
 * Displays a collapsible section of tasks grouped by day.
 *
 * @param {string} title - The section heading (e.g. "Today", "Tomorrow")
 * @param {Array} tasks - Array of task objects to display
 * @param {Function} setTasks - State setter to update the tasks array
 * @param {boolean} [overdue=false] - Whether the section represents overdue tasks
 * @returns {JSX.Element|null} The day section, or null if no tasks
 */
function TaskGroup({ title, tasks = [], setTasks, overdue = false}) {
    const [isOpen, setIsOpen] = useState(true);

    function handleDelete(id) {
        api.delete(`/api/time-blocks/${id}/`)
            .then(() => setTasks(t => t.filter(task => task.id !== id)))
            .catch(err => console.error("Failed to delete task", err));
    }

    if (tasks.length === 0) return null;

    return (
        <>
            <div className="day-section" onClick={() => setIsOpen(!isOpen)}>
                <span className={`arrow ${isOpen ? "open" : "closed"}`}>^</span>
                <h5 className={overdue ? "overdue-title" : ""}>{title}</h5>
                <h5 className="number-of-tasks">({tasks.length})</h5>
            </div>
            {isOpen && tasks.map(task => (
                <TaskItem key={task.id} name={task.name} datetime={task.datetime}
                          onDelete={() => handleDelete(task.id)} overdue={overdue} />
            ))}
        </>
    );
}

export default TaskGroup;