import { useState, useRef } from 'react';
import playDing from '../../utils/Audio/playDing.js';
import useDropdown from '../../utils/Hooks/useDropdown.js';
import useDropup from '../../utils/Hooks/useDropup.js';
import TaskItemContent from './TaskItemContent.jsx';
import TaskOptionsDropdown from './TaskOptionsDropdown.jsx';
import './stylesheets/TaskItem.css';

/**
 * Displays a single task item with a checkbox, name, start time and end time.
 * Plays a ding sound and fades out on click before completing.
 * Provides a dropdown menu for editing, undoing completion, and deleting the task.
 *
 * @param {number} id - The task ID
 * @param {string} name - The task name
 * @param {string} date - Date string (e.g. "2026-02-19")
 * @param {string} startTime - Start time string (e.g. "09:00:00")
 * @param {string} endTime - End time string (e.g. "10:00:00")
 * @param {Function} onDelete - Callback to delete the task
 * @param {Function} [onComplete] - Callback to mark the task as completed
 * @param {Function} [onUndoComplete] - Callback to undo completion
 * @param {boolean} [overdue=false] - Whether the task is overdue
 * @param {boolean} [completed=false] - Whether the task is already completed
 * @returns {JSX.Element} A single task
 */
function TaskItem({ id, name, date, startTime, endTime, onDelete, onComplete, onUndoComplete, overdue = false, completed = false }) {
    const [checked, setChecked] = useState(false);
    const [fading, setFading] = useState(false);
    const { dropdownOpen, setDropdownOpen, dropdownRef } = useDropdown();
    const optionsBtnRef = useRef(null);
    const dropup = useDropup(dropdownOpen, optionsBtnRef, dropdownRef);

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
        <div className="task-item-wrapper">
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
                <button className="task-options-btn" onClick={handleOptionsClick} ref={optionsBtnRef}>
                    ⋮
                </button>
                {dropdownOpen && (
                    <TaskOptionsDropdown
                        id={id}
                        completed={completed}
                        dropup={dropup}
                        setDropdownOpen={setDropdownOpen}
                        onDelete={onDelete}
                        onUndoComplete={onUndoComplete}
                    />
                )}
            </div>
        </div>
    );
}

export default TaskItem;