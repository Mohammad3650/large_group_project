import TaskItem from './TaskItem.jsx';
import handleDeleteDashboardTask from '../../../utils/Helpers/handleDeleteDashboardTask.js';
import getTaskFlags from '../../../utils/Helpers/getTaskFlags.js';

/**
 * Renders the list of TaskItem components for a task group.
 *
 * @param {Object} props
 * @param {Array} props.tasks - Array of task objects to render
 * @param {string} props.title - The group title, used as part of each task's key
 * @param {boolean} props.overdue - Whether the group is an overdue group
 * @param {boolean} props.completed - Whether the group is a completed group
 * @param {Function} props.setTasks - State setter used to remove a deleted task
 * @param {Function} [props.onComplete] - Callback invoked when a task is marked as completed
 * @param {Function} [props.onUndoComplete] - Callback invoked when a task completion is undone
 * @param {Function} [props.onPin] - Callback invoked when a task is pinned
 * @param {Function} [props.onUnpin] - Callback invoked when a task is unpinned
 * @returns {Array<React.JSX.Element>} Array of TaskItem elements
 */
function TaskItemList({ tasks, title, overdue, completed, setTasks, onComplete, onUndoComplete, onPin, onUnpin }) {
    const getFlags = getTaskFlags(overdue, completed);

    return tasks.map((task) => {
        const { taskCompleted, taskOverdue } = getFlags(task);

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