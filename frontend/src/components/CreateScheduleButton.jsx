import { useNavigate } from "react-router-dom";

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