import { useState } from 'react';
import TaskItem from './TaskItem.jsx';
import deleteTimeBlock from '../../utils/Api/deleteTimeBlock.js';
import getDate from '../../utils/Helpers/getDate.js';
import getDateBoundaries from '../../utils/Helpers/getDateBoundaries.js';
import './stylesheets/TaskGroup.css';

/**
 * Displays a collapsible section of tasks grouped by date or category.
 *
 * The overdue and completed states are derived from the variant prop, so callers
 * only need to pass variant — no separate boolean flags are required.
 *
 * @param {string} title - The section heading (e.g. "Today", "Pinned")
 * @param {Array} tasks - Array of task objects to display
 * @param {Function} setTasks - State setter to update the tasks array
 * @param {string} [variant=''] - CSS variant controlling the coloured left border and title colour.
 *   Accepted values: 'pinned', 'overdue', 'today', 'tomorrow', 'week', 'beyond', 'completed'
 * @param {Function} [onComplete] - Callback invoked when a task is marked as completed
 * @param {Function} [onUndoComplete] - Callback invoked when a task completion is undone
 * @param {Function} [onPin] - Callback invoked when a task is pinned
 * @param {Function} [onUnpin] - Callback invoked when a task is unpinned
 * @returns {JSX.Element|null} The task group section, or null if the tasks array is empty
 */
function TaskGroup({ title, tasks = [], setTasks, variant = '', onComplete, onUndoComplete, onPin, onUnpin }) {
    const [isOpen, setIsOpen] = useState(true);

    const overdue = variant === 'overdue';
    const completed = variant === 'completed';

    function handleDelete(id) {
        deleteTimeBlock(id)
            .then(() => setTasks((prev) => prev.filter((task) => task.id !== id)))
            .catch(() => {});
    }

    if (tasks.length === 0) return null;

    const titleClass =
        overdue ? 'overdue-title' :
            completed ? 'completed-title' :
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