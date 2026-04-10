import useTaskGroup from '../utils/Hooks/useTaskGroup.js';
import TaskGroupHeader from './TaskGroupHeader.jsx';
import TaskItemList from './TaskItemList.jsx';
import '../stylesheets/TaskSection/TaskGroup.css';

/**
 * Displays a collapsible section of tasks grouped by date or category.
 *
 * The overdue and completed states are derived from the variant prop, so callers
 * only need to pass variant — no separate boolean flags are required.
 *
 * @param {Object} props
 * @param {string} props.title - The section heading (e.g. "Today", "Pinned")
 * @param {Array} props.tasks - Array of task objects to display
 * @param {Function} props.setTasks - State setter to update the tasks array
 * @param {string} [props.variant=''] - CSS variant controlling the coloured left border and title colour.
 *   Accepted values: 'pinned', 'overdue', 'today', 'tomorrow', 'week', 'beyond', 'completed'
 * @param {Function} [props.onComplete] - Callback invoked when a task is marked as completed
 * @param {Function} [props.onUndoComplete] - Callback invoked when a task completion is undone
 * @param {Function} [props.onPin] - Callback invoked when a task is pinned
 * @param {Function} [props.onUnpin] - Callback invoked when a task is unpinned
 * @returns {React.JSX.Element|null} The task group section, or null if the tasks array is empty
 */
function TaskGroup({ title, tasks = [], setTasks, variant = '', onComplete, onUndoComplete, onPin, onUnpin }) {
    const { isOpen, setIsOpen, overdue, completed } = useTaskGroup(variant);

    if (tasks.length === 0) return null;

    return (
        <>
            <TaskGroupHeader
                isOpen={isOpen}
                onToggle={() => setIsOpen(!isOpen)}
                title={title}
                variant={variant}
                taskCount={tasks.length}
            />
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
