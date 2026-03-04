import { useNavigate } from "react-router-dom";
import "./AddTaskButton.css"

/**
 * @returns {JSX.Element} A button that navigates to the create schedule page
 */
function AddTaskButton() {
    const nav = useNavigate();
    return(
        <button className="add-task-btn"
                   onClick={() => nav("/create-schedule")}>+ Add Task</button>
    );
}

export default AddTaskButton;