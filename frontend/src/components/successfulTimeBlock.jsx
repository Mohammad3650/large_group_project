import { useNavigate, useLocation } from "react-router-dom";
import "../SuccessPageStyle.css";
import tickImage from "../functionality/landingpage/photos/tick.png";



function SuccessfulTimeBlock({ block }){
    const nav = useNavigate();
    const location = useLocation();
    const blockId = location.state?.id;

    return(
        <>
            <div className="success-page">
                <div className="succes-card">
                    <h1 className="success-text">Time Block Created Successfully</h1>

                    <div className="tick-image">
                        <img className="photo" src={tickImage}></img>
                    </div>

                    <h3>Your time block was created successfully. You can either create a new time block or return to your dashboard.</h3>
                
                    <div className="success-btns">
                        <button
                        className="go-timeblock-btn"
                        onClick={() => nav("/create-schedule")}
                        >
                            New Time Block
                        </button>

                        {blockId && (
                        <button
                            onClick={() => nav(`/timeblocks/${blockId}/edit`)}
                        >
                            Edit
                        </button>
                        )}
            
                        <button
                        className="go-dashboard-btn"
                        onClick={() => nav("/dashboard")}
                        >
                            Return To Dashboard
                        </button>
                    </div>
                </div>
            </div>
        </>

    );
}
export default SuccessfulTimeBlock;