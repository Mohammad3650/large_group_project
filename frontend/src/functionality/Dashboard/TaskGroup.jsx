import { useState } from 'react';
import TaskItem from './TaskItem.jsx';
import getDate from '../../utils/Helpers/getDate.js';
import getDateBoundaries from '../../utils/Helpers/getDateBoundaries.js';
import deleteTimeBlock from '../../utils/Api/deleteTimeBlock.js';
import './stylesheets/TaskGroup.css';

/**
 * Displays a collapsible section of tasks grouped by day or category.
 *
 * @param {string} title - The section heading (e.g. "Today", "Pinned")
 * @param {Array} tasks - Array of task objects to display
 * @param {Function} setTasks - State setter to update the tasks array
 * @param {boolean} [overdue=false] - Whether the section represents overdue tasks
 * @param {boolean} [completed=false] - Whether the section represents completed tasks
 * @param {boolean} [nextWeek=false] - Whether the section represents next 7 days tasks
 * @param {string} [variant=''] - CSS variant class for the coloured left border accent
 * @param {Function} [onComplete] - Callback to mark a task as completed
 * @param {Function} [onUndoComplete] - Callback to undo a task completion
 * @param {Function} [onPin] - Callback to pin a task
 * @param {Function} [onUnpin] - Callback to unpin a task
 * @returns {JSX.Element|null} The task group section, or null if no tasks
 */
function TaskGroup({ title, tasks = [], setTasks, overdue = false, completed = false, nextWeek = false, variant = '', onComplete, onUndoComplete, onPin, onUnpin }) {
    const [isOpen, setIsOpen] = useState(true);

    function handleDelete(id) {
        deleteTimeBlock(id)
            .then(() => setTasks((prev) => prev.filter((task) => task.id !== id)))
            .catch(() => {});
    }

    if (tasks.length === 0) return null;

    const titleClass =
        overdue ? 'overdue-title' :
            completed ? 'completed-title' :
                nextWeek ? 'next-week-title' :
                    variant === 'pinned' ? 'pinned-title' : '';

    return (
        <>
            <div className="task-group" data-testid="task-group-header" onClick={() => setIsOpen(!isOpen)}>
                <span className={`arrow ${isOpen ? 'open' : 'closed'}`}>^</span>
                <h5 className={titleClass}>{title}</h5>
                <h5 className="number-of-tasks">({tasks.length})</h5>
            </div>
            {isOpen && (
                <div className={`task-items-container ${variant}`}>
                    {(() => {
                        const { today } = getDateBoundaries();
                        return tasks.map((task) => {
                            const taskCompleted = completed || !!task.completed_at;
                            const taskOverdue = overdue || (!task.completed_at && getDate(task) < today);
                            return (
                                <TaskItem
                                    key={`${title}-${task.id}`}
                                    task={task}
                                    onDelete={() => handleDelete(task.id)}
                                    onComplete={onComplete ? () => onComplete(task) : undefined}
                                    onUndoComplete={onUndoComplete ? () => onUndoComplete(task) : undefined}
                                    onPin={onPin ? () => onPin(task) : undefined}
                                    onUnpin={onUnpin ? () => onUnpin(task) : undefined}
                                    overdue={taskOverdue}
                                    completed={taskCompleted}
                                />
                            );
                        });
                    })()}
                </div>
            )}
        </>
    );
}

export default TaskGroup;