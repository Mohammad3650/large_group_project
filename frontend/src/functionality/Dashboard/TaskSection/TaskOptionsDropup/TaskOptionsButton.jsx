import useDropdown from '../../../../utils/Hooks/useDropdown.js';
import TaskOptionsDropup from './TaskOptionsDropup.jsx';
import '../../stylesheets/TaskOptionsButton.css';

/**
 * A button that toggles a drop-up menu of task options.
 *
 * @param {Object} props
 * @param {number} props.id - The task ID
 * @param {boolean} props.completed - Whether the task is completed
 * @param {Function} props.onDelete - Callback to delete the task
 * @param {Function} [props.onUndoComplete] - Callback to undo completion
 * @param {Function} props.onViewDetails - Callback to open the task details popup
 * @returns {JSX.Element} The options button and its drop-up menu
 */
function TaskOptionsButton({ id, completed, onDelete, onUndoComplete, onViewDetails }) {
    const { dropdownOpen, setDropdownOpen, dropdownRef } = useDropdown();

    function handleOptionsClick(e) {
        e.stopPropagation();
        setDropdownOpen((prev) => !prev);
    }

    return (
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
                    onViewDetails={onViewDetails}
                />
            )}
        </div>
    );
}

export default TaskOptionsButton;