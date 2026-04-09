import { useState } from 'react';
import useTaskItem from '../../../utils/Hooks/useTaskItem.js';
import TaskItemContent from './TaskItemContent.jsx';
import TaskOptionsButton from '../TaskOptionsDropup/TaskOptionsButton.jsx';
import TaskDetailsPopup from '../TaskDetailsPopup/TaskDetailsPopup.jsx';
import PinButton from './PinButton.jsx';
import '../stylesheets/TaskSection/TaskItem.css';

/**
 * Displays a single task item with a pin button, checkbox, name, time and date.
 * Plays a ding sound and fades out on completion.
 * Provides a drop-up menu for viewing details, editing, undoing completion, and deleting.
 *
 * @param {Object} props
 * @param {Object} props.task - The task data object
 * @param {Function} props.onDelete - Callback to delete the task
 * @param {Function} [props.onComplete] - Callback to mark the task as completed
 * @param {Function} [props.onUndoComplete] - Callback to undo completion
 * @param {Function} [props.onPin] - Callback to pin the task
 * @param {Function} [props.onUnpin] - Callback to unpin the task
 * @param {boolean} [props.overdue=false] - Whether the task is overdue
 * @param {boolean} [props.completed=false] - Whether the task is already completed
 * @returns {React.JSX.Element} A single task item
 */
function TaskItem({ task, onDelete, onComplete, onUndoComplete, onPin, onUnpin, overdue = false, completed = false }) {
    const { id, name, date, startTime, endTime, checked, fading, handleClick } =
        useTaskItem(task, onComplete, completed);
    const [detailsOpen, setDetailsOpen] = useState(false);

    return (
        <>
            <div className="task-item-wrapper">
                {(onPin || onUnpin) && (
                    <PinButton
                        pinned={task.pinned}
                        onPin={onPin}
                        onUnpin={onUnpin}
                    />
                )}
                <TaskItemContent
                    name={name}
                    date={date}
                    startTime={startTime}
                    endTime={endTime}
                    checked={checked}
                    fading={fading}
                    overdue={overdue}
                    completed={completed}
                    onClick={handleClick}
                />
                <TaskOptionsButton
                    id={id}
                    completed={completed}
                    onDelete={onDelete}
                    onUndoComplete={onUndoComplete}
                    onViewDetails={() => setDetailsOpen(true)}
                />
            </div>
            {detailsOpen && (
                <TaskDetailsPopup
                    task={task}
                    onClose={() => setDetailsOpen(false)}
                />
            )}
        </>
    );
}

export default TaskItem;