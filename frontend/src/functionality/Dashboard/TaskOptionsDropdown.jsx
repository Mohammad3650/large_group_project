import { useNavigate } from 'react-router-dom';
import { FaEye, FaEdit, FaUndo, FaTrash } from 'react-icons/fa';
import './stylesheets/TaskOptionsDropdown.css';

/**
 * Dropdown menu for a task item with options to view details, edit, delete, and undo completion.
 *
 * @param {number} props.id - The task ID
 * @param {boolean} props.completed - Whether the task is completed
 * @param {boolean} props.dropup - Whether the dropdown should open upwards
 * @param {Function} props.setDropdownOpen - Setter to close the dropdown
 * @param {Function} props.onDelete - Callback to delete the task
 * @param {Function} props.onUndoComplete - Callback to undo completion
 * @param {Function} props.onViewDetails - Callback to open the details popup
 * @returns {JSX.Element} The dropdown menu
 */
function TaskOptionsDropdown({ id, completed, dropup, setDropdownOpen, onDelete, onUndoComplete, onViewDetails }) {
    const nav = useNavigate();

    function handleViewDetailsClick(e) {
        e.stopPropagation();
        setDropdownOpen(false);
        onViewDetails();
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
        <div className={`task-options-dropdown${dropup ? ' drop-up' : ''}`}>
            <button className="task-options-edit-btn" onClick={handleViewDetailsClick}>
                <FaEye /> View Details
            </button>
            <hr className="task-options-divider" />
            {completed && (
                <>
                    <button className="task-options-edit-btn" onClick={handleUndoCompleteClick}>
                        <FaUndo /> Undo Completion
                    </button>
                    <hr className="task-options-divider" />
                </>
            )}
            <button className="task-options-edit-btn" onClick={handleEditClick}>
                <FaEdit /> Edit
            </button>
            <hr className="task-options-divider" />
            <button className="task-options-delete-btn" onClick={handleDeleteClick}>
                <FaTrash /> Delete
            </button>
        </div>
    );
}

export default TaskOptionsDropdown;
