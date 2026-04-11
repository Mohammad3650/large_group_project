import { useState } from 'react';
import TaskItemList from './TaskItemList.jsx';
import getTitleClass from './utils/helpers/getTitleClass.js';
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

    if (tasks.length === 0) return null;

    return (
        <>
            <div className="task-group" data-testid="task-group-header" onClick={() => setIsOpen(!isOpen)}>
                <span className={`arrow ${isOpen ? 'open' : 'closed'}`}>^</span>
                <h5 className={getTitleClass(variant)}>{title}</h5>
                <h5 className="number-of-tasks">({tasks.length})</h5>
            </div>
            {isOpen && (
                <div className={`task-items-container ${variant}`}>
                    <TaskItemList
                        tasks={tasks}
                        title={title}
                        overdue={overdue}
                        completed={completed}
                        setTasks={setTasks}
                        onComplete={onComplete}
                        onUndoComplete={onUndoComplete}
                        onPin={onPin}
                        onUnpin={onUnpin}
                    />
                </div>
            )}
        </>
    );
}

export default TaskGroup;
