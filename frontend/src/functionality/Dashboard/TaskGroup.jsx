import TaskItem from './TaskItem.jsx';
import { useState } from 'react';
import './stylesheets/TaskGroup.css';
import deleteTimeBlock from '../../utils/Api/deleteTimeBlock.js';

/**
 * Displays a collapsible section of tasks grouped by day.
 *
 * @param {string} title - The section heading (e.g. "Today", "Tomorrow")
 * @param {Array} tasks - Array of task objects to display
 * @param {Function} setTasks - State setter to update the tasks array
 * @param {boolean} [overdue=false] - Whether the section represents overdue tasks
 * @returns {JSX.Element|null} The day section, or null if no tasks
 */
function TaskGroup({ title, tasks = [], setTasks, overdue = false }) {
    const [isOpen, setIsOpen] = useState(true);

    function handleDelete(id) {
        deleteTimeBlock(id)
            .then(() => setTasks((t) => t.filter((task) => task.id !== id)))
            .catch(() => {});
    }

    if (tasks.length === 0) return null;

    return (
        <>
            <div
                className="day-section"
                data-testid="task-group-header"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={`arrow ${isOpen ? 'open' : 'closed'}`}>^</span>
                <h5 className={overdue ? 'overdue-title' : ''}>{title}</h5>
                <h5 className="number-of-tasks">({tasks.length})</h5>
            </div>
            {isOpen &&
                tasks.map((task) => (
                    <TaskItem
                        key={task.id}
                        name={task.name}
                        date={task.date}
                        startTime={task.startTime}
                        endTime={task.endTime}
                        onDelete={() => handleDelete(task.id)}
                        overdue={overdue}
                    />
                ))}
        </>
    );
}

export default TaskGroup;
