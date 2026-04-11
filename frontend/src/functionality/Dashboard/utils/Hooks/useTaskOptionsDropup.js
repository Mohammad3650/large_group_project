import { useNavigate } from 'react-router-dom';

/**
 * Manages event handlers for the task options drop-up menu.
 *
 * @param {Object} params
 * @param {number} params.id - The task ID
 * @param {Function} params.setDropdownOpen - Setter to close the menu
 * @param {Function} params.onDelete - Callback to delete the task
 * @param {Function} params.onUndoComplete - Callback to undo completion
 * @param {Function} params.onViewDetails - Callback to open the details popup
 * @returns {Object} handleViewDetailsClick, handleEditClick, handleUndoCompleteClick, handleDeleteClick
 */
function useTaskOptionsDropup({ id, setDropdownOpen, onDelete, onUndoComplete, onViewDetails }) {
    const navigate = useNavigate();

    function handleViewDetailsClick(event) {
        event.stopPropagation();
        setDropdownOpen(false);
        onViewDetails();
    }

    function handleEditClick(event) {
        event.stopPropagation();
        setDropdownOpen(false);
        navigate(`/time-blocks/${id}/edit`);
    }

    function handleUndoCompleteClick(event) {
        event.stopPropagation();
        setDropdownOpen(false);
        onUndoComplete();
    }

    function handleDeleteClick(event) {
        event.stopPropagation();
        const confirmed = confirm('Are you sure you want to delete this task?');
        if (confirmed) {
            setDropdownOpen(false);
            onDelete();
        }
    }

    return { handleViewDetailsClick, handleEditClick, handleUndoCompleteClick, handleDeleteClick };
}

export default useTaskOptionsDropup;
