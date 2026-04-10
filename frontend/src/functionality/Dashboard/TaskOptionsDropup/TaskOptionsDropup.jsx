import { FaEye, FaEdit, FaUndo, FaTrash } from 'react-icons/fa';
import useTaskOptionsDropup from '../utils/Hooks/useTaskOptionsDropup.js';
import '../stylesheets/TaskOptionsDropup/TaskOptionsDropup.css';

/**
 * Drop-up menu for a task item with options to view details, edit, delete, and undo completion.
 *
 * @param {Object} props
 * @param {number} props.id - The task ID
 * @param {boolean} props.completed - Whether the task is completed
 * @param {Function} props.setDropdownOpen - Setter to close the menu
 * @param {Function} props.onDelete - Callback to delete the task
 * @param {Function} props.onUndoComplete - Callback to undo completion
 * @param {Function} props.onViewDetails - Callback to open the details popup
 * @returns {React.JSX.Element} The drop-up menu
 */
function TaskOptionsDropup({ id, completed, setDropdownOpen, onDelete, onUndoComplete, onViewDetails }) {
    const { handleViewDetailsClick, handleEditClick, handleUndoCompleteClick, handleDeleteClick } =
        useTaskOptionsDropup({ id, setDropdownOpen, onDelete, onUndoComplete, onViewDetails });

    return (
        <div className="task-options-drop-up">
            {completed && (
                <>
                    <button className="task-options-edit-btn" onClick={handleUndoCompleteClick}>
                        <FaUndo /> Undo Completion
                    </button>
                    <hr className="task-options-divider" />
                </>
            )}
            <button className="task-options-edit-btn" onClick={handleViewDetailsClick}>
                <FaEye /> View Details
            </button>
            <hr className="task-options-divider" />
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

export default TaskOptionsDropup;