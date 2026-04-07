import TaskItem from './TaskItem.jsx';
import handleDeleteDashboardTask from '../../utils/Helpers/handleDeleteDashboardTask.js';
import getDate from '../../utils/Helpers/getDate.js';
import getDateBoundaries from '../../utils/Helpers/getDateBoundaries.js';
import './stylesheets/TaskItemList.css';

/**
 * Renders the list of TaskItem components for a task group.
 * Derives per-task overdue and completed states by combining the group-level
 * flags with each task's own data.
 *
 * @param {Array} tasks - Array of task objects to render
 * @param {string} title - The group title, used as part of each task's key
 * @param {boolean} overdue - Whether the group is an overdue group
 * @param {boolean} completed - Whether the group is a completed group
 * @param {Function} setTasks - State setter used to remove a deleted task
 * @param {Function} [onComplete] - Callback invoked when a task is marked as completed
 * @param {Function} [onUndoComplete] - Callback invoked when a task completion is undone
 * @param {Function} [onPin] - Callback invoked when a task is pinned
 * @param {Function} [onUnpin] - Callback invoked when a task is unpinned
 * @returns {Array<JSX.Element>} Array of TaskItem elements
 */
function TaskItemList({ tasks, title, overdue, completed, setTasks, onComplete, onUndoComplete, onPin, onUnpin }) {
    const { today } = getDateBoundaries();

    return tasks.map((task) => {
        const taskCompleted = completed || !!task.completed_at;
        const taskOverdue = overdue || (!task.completed_at && getDate(task) < today);

        return (
            <TaskItem
                key={`${title}-${task.id}`}
                task={task}
                onDelete={() => handleDeleteDashboardTask(task.id, setTasks)}
                onComplete={onComplete ? () => onComplete(task) : undefined}
                onUndoComplete={onUndoComplete ? () => onUndoComplete(task) : undefined}
                onPin={onPin ? () => onPin(task) : undefined}
                onUnpin={onUnpin ? () => onUnpin(task) : undefined}
                overdue={taskOverdue}
                completed={taskCompleted}
            />
        );
    });
}

export default TaskItemList;
