import { useNavigate } from 'react-router-dom';
import './stylesheets/AddTaskButton.css';

/**
 * @returns {React.JSX.Element} A button that navigates to the create schedule page
 */
function AddTaskButton() {
    const navigate = useNavigate();
    return (
        <button
            className="add-task-btn"
            onClick={() => navigate('/create-schedule')}
        >
            + Add Task
        </button>
    );
}

export default AddTaskButton;
