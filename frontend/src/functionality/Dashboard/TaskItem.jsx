import { useState } from 'react';
import playDing from '../../utils/Audio/playDing.js';
import useDropdown from '../../utils/Hooks/useDropdown.js';
import TaskItemContent from './TaskItemContent.jsx';
import TaskOptionsDropup from './TaskOptionsDropup.jsx';
import TaskDetailsPopup from './TaskDetailsPopup.jsx';
import PinButton from './PinButton.jsx';
import './stylesheets/TaskItem.css';

/**
 * Displays a single task item with a pin button, checkbox, name, and time.
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
 * @returns {JSX.Element} A single task item
 */
function TaskItem({ task, onDelete, onComplete, onUndoComplete, onPin, onUnpin, overdue = false, completed = false }) {
    const { id, name, date, startTime, endTime } = task;
    const [checked, setChecked] = useState(false);
    const [fading, setFading] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const { dropdownOpen, setDropdownOpen, dropdownRef } = useDropdown();

    function handleClick() {
        if (checked || completed) return;
        playDing();
        setChecked(true);
        setFading(true);
        setTimeout(() => onComplete?.(), 500);
    }

    function handleOptionsClick(e) {
        e.stopPropagation();
        setDropdownOpen((prev) => !prev);
    }

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
                <div className="task-options" ref={dropdownRef}>
                    <button className="task-options-btn" onClick={handleOptionsClick}>
                        ⋮
                    </button>
                    {dropdownOpen && (
                        <TaskOptionsDropup
                            id={id}
                            completed={completed}
                            setDropdownOpen={setDropdownOpen}
                            onDelete={onDelete}
                            onUndoComplete={onUndoComplete}
                            onViewDetails={() => setDetailsOpen(true)}
                        />
                    )}
                </div>
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
