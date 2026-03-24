import { useNavigate } from "react-router-dom";

/**
 * Button component that navigates the user to the create schedule page.
 *
 * @returns {JSX.Element} A styled button that, when clicked, redirects
 * the user to the "/create-schedule" route.
 */

function CreateScheduleButton(){
    const nav = useNavigate();

    return (
    <button
        className="btn btn-primary me-2"
        onClick={() => nav("/create-schedule")}
    >
        Create Schedule
    </button>
    );
}

export default CreateScheduleButton;