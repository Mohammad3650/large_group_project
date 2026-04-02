import { useState } from 'react';
import './stylesheets/TaskItem.css';
import formatDateTime from '../../utils/Formatters/formatDateTime.js';
import playDing from '../../utils/Audio/playDing.js';
import useDropdown from '../../utils/Hooks/useDropdown.js';
import { useNavigate } from 'react-router-dom';

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
 * @param {boolean} [dropUp=false] - Whether the dropdown should open upwards
 * @returns {JSX.Element} A single task
 */
function TaskItem({ id, name, date, startTime, endTime, onDelete, onComplete, onUndoComplete, overdue = false, completed = false, dropUp = false }) {
    const [checked, setChecked] = useState(false);
    const [fading, setFading] = useState(false);
    const { dropdownOpen, setDropdownOpen, dropdownRef } = useDropdown();
    const nav = useNavigate();

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

    function handleEditClick(e) {
        e.stopPropagation();
        setDropdownOpen(false);
        nav(`/timeblocks/${id}/edit`);
    }

    function handleUndoCompleteClick(e) {
        e.stopPropagation();
        setDropdownOpen(false);
        onUndoComplete();
    }

    function handleDeleteClick(e) {
        e.stopPropagation();
        const confirmed = confirm('Are you sure you want to delete this task?');
        if (confirmed) {
            setDropdownOpen(false);
            onDelete();
        }
    }

    return (
        <div className="task-item-wrapper">
            <div
                className={`form-check task-item ${checked ? 'checked' : ''} ${fading ? 'fading' : ''}`}
                onClick={handleClick}
            >
                <input
                    className="form-check-input"
                    type="checkbox"
                    readOnly
                    checked={checked}
                />
                <label className={`form-check-label ${overdue ? 'overdue-text' : ''} ${completed ? 'completed-text' : ''}`}>
                    {name}
                </label>
                <span className="task-datetime">
                    {formatDateTime(date, startTime, endTime)}
                </span>
            </div>

            <div className="task-options" ref={dropdownRef}>
                <button className="task-options-btn" onClick={handleOptionsClick}>
                    ⋮
                </button>

                {dropdownOpen && (
                    <div className={`task-options-dropdown${dropUp ? ' dropUp' : ''}`}>
                        {completed && (
                            <>
                                <button className="task-options-edit-btn" onClick={handleUndoCompleteClick}>
                                    Undo Complete
                                </button>
                                <hr className="task-options-divider" />
                            </>
                        )}
                        <button className="task-options-edit-btn" onClick={handleEditClick}>
                            Edit
                        </button>
                        <hr className="task-options-divider" />
                        <button className="task-options-delete-btn" onClick={handleDeleteClick}>
                            Delete
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default TaskItem;
