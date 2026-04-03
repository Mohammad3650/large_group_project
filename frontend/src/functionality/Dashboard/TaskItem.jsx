import { useState } from 'react';
import playDing from '../../utils/Audio/playDing.js';
import useDropdown from '../../utils/Hooks/useDropdown.js';
import TaskItemContent from './TaskItemContent.jsx';
import TaskOptionsDropup from './TaskOptionsDropup.jsx';
import TaskDetailsPopup from './TaskDetailsPopup.jsx';
import './stylesheets/TaskItem.css';

/**
 * Displays a single task item with a checkbox, name, start time and end time.
 * Plays a ding sound and fades out on click before completing.
 * Provides a drop-up menu for viewing details, editing, undoing completion, and deleting.
 *
 * @param {Object} props
 * @param {number} props.id - The task ID
 * @param {string} props.name - The task name
 * @param {string} props.date - Date string (e.g. "2026-02-19")
 * @param {string} props.startTime - Start time string (e.g. "09:00:00")
 * @param {string} props.endTime - End time string (e.g. "10:00:00")
 * @param {string} props.location - Task location
 * @param {string} props.blockType - Block type
 * @param {string} props.description - Task description
 * @param {Function} props.onDelete - Callback to delete the task
 * @param {Function} [props.onComplete] - Callback to mark the task as completed
 * @param {Function} [props.onUndoComplete] - Callback to undo completion
 * @param {boolean} [props.overdue=false] - Whether the task is overdue
 * @param {boolean} [props.completed=false] - Whether the task is already completed
 * @returns {JSX.Element} A single task
 */
function TaskItem({ id, name, date, startTime, endTime, location, blockType, description, onDelete, onComplete, onUndoComplete, overdue = false, completed = false, variant = '' }) {
    const [checked, setChecked] = useState(false);
    const [fading, setFading] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const { dropdownOpen, setDropdownOpen, dropdownRef } = useDropdown();

    function handleClick() {
        if (checked || completed) return;
        playDing();
        setChecked(true);
        setFading(true);
        setTimeout(() => onComplete(), 500);
    }

    function handleOptionsClick(e) {
        e.stopPropagation();
        setDropdownOpen((prev) => !prev);
    }

    return (
        <>
            <div className={`task-item-wrapper ${variant}`}>
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
                    task={{ name, date, startTime, endTime, location, blockType, description }}
                    onClose={() => setDetailsOpen(false)}
                />
            )}
        </>
    );
}

export default TaskItem;
