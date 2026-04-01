import { useState } from 'react';
import './stylesheets/TaskItem.css';
import formatDateTime from '../../utils/Formatters/formatDateTime.js';
import playDing from '../../utils/Audio/playDing.js';
import useDropdown from '../../utils/Hooks/useDropdown.js';
import { useNavigate } from 'react-router-dom';

/**
 * Displays a single task item with a checkbox, name, start time and end time.
 * Plays a ding sound and fades out on click before deleting.
 * Provides a dropdown menu for editing and deleting the task.
 *
 * @param {number} id - The task ID
 * @param {string} name - The task name
 * @param {string} date - Date string (e.g. "2026-02-19")
 * @param {string} startTime - Start time string (e.g. "09:00:00")
 * @param {string} endTime - End time string (e.g. "10:00:00")
 * @param {Function} onDelete - Callback to the handleDelete function from the TaskGroup component
 * @param {boolean} [overdue=false] - Whether the task is overdue
 * @returns {JSX.Element} A single task
 */
function TaskItem({ id, name, date, startTime, endTime, onDelete, overdue = false }) {
    const [checked, setChecked] = useState(false);
    const [fading, setFading] = useState(false);
    const { dropdownOpen, setDropdownOpen, dropdownRef } = useDropdown();
    const nav = useNavigate();

    function handleClick() {
        if (checked) return;
        playDing();
        setChecked(true);
        setFading(true);
        setTimeout(() => onDelete(), 500);
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
                <label className={`form-check-label ${overdue ? 'overdue-text' : ''}`}>
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
                    <div className="task-options-dropdown">
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