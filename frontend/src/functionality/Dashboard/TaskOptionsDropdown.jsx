import { useNavigate } from 'react-router-dom';
import "./stylesheets/TaskOptionsDropdown.css"

/**
 * Dropdown menu for a task item with options to edit, delete, and undo completion.
 *
 * @param {number} id - The task ID
 * @param {boolean} completed - Whether the task is completed
 * @param {boolean} dropup - Whether the dropdown should open upwards
 * @param {Function} setDropdownOpen - Setter to close the dropdown
 * @param {Function} onDelete - Callback to delete the task
 * @param {Function} onUndoComplete - Callback to undo completion
 * @returns {JSX.Element} The dropdown menu
 */
function TaskOptionsDropdown({ id, completed, dropup, setDropdownOpen, onDelete, onUndoComplete }) {
    const nav = useNavigate();

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
        <div className={`task-options-dropdown${dropup ? ' drop-up' : ''}`}>
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
    );
}

export default TaskOptionsDropdown;