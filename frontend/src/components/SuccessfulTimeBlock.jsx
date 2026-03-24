import { useNavigate, useLocation } from "react-router-dom";
import "./stylesheets/SuccessfulTimeBlock.css";
import tickImage from "../assets/TimeBlock/tick.png";



function SuccessfulTimeBlock({ block }){
    const nav = useNavigate();
    const location = useLocation();
    const blockId = location.state?.id;

    return(
        <>
            <div className="success-page">
                <div className="success-card">
                    <h1 className="success-text">Time Block Created Successfully</h1>

                    <div className="tick-image">
                        <img className="photo" src={tickImage} alt="Success tick icon"></img>
                    </div>

                    <h3>Your time block was created successfully</h3>
                
                    <div className="success-btns">
                        <button
                        className="go-timeblock-btn"
                        onClick={() => nav("/create-schedule")}
                        >
                            New Time Block
                        </button>

                        {blockId && (
                        <button
                        className="edit-timeblock-btn"
                            onClick={() => nav(`/timeblocks/${blockId}/edit`)}
                        >
                            Edit Time Block
                        </button>
                        )}
            
                        <button
                        className="go-dashboard-btn"
                        onClick={() => nav("/dashboard")}
                        >
                            Return To Dashboard
                        </button>

                        <button
                        className="go-calendar-btn"
                        onClick={() => nav("/calendar")}
                        >
                            View in Calendar
                        </button>
                    </div>
                </div>
            </div>
        </>

    );
}
export default SuccessfulTimeBlock;