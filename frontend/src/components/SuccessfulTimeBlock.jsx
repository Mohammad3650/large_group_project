import { useNavigate, useLocation } from 'react-router-dom';
import './stylesheets/SuccessfulTimeBlock.css';
import tickImage from '../assets/TimeBlock/tick.png';

/**
 * Displays a success page after creating a time block.
 * Provides navigation options to create another block,
 * edit the created block, or navigate elsewhere.
 *
 * @returns {JSX.Element} A success message UI with navigation buttons.
 */

function SuccessfulTimeBlock() {
    const nav = useNavigate();
    const location = useLocation();
    const blockId = location.state?.id;
    const action = location.state?.action || 'created';
    const buttons = [
    {
        label: "New Time Block",
        className: "go-timeblock-btn",
        action: () => nav('/create-schedule'),
    },
    {
        label: "Return To Dashboard",
        className: "go-dashboard-btn",
        action: () => nav('/dashboard'),
    },
    {
        label: "View in Calendar",
        className: "go-calendar-btn",
        action: () => nav('/calendar'),
    },
    ];

    return (
        <div className="success-page">
            <div className="success-card">
                <h1 className="success-text">
                    Time Block {action === 'edited' ? 'Updated' : 'Created'} Successfully
                </h1>

                <div className="tick-image">
                    <img
                        className="photo"
                        src={tickImage}
                        alt="Success tick icon"
                    ></img>
                </div>

                <h3>Your time block was {action === 'edited' ? 'updated' : 'created'} successfully</h3>

                <div className="success-btns">
                    {buttons.map((btn, index) => (
                        <button
                            key={index}
                            className={btn.className}
                            onClick={btn.action}
                        >
                            {btn.label}
                        </button>
                    ))}

                    {blockId && (
                        <button
                            className="edit-timeblock-btn"
                            onClick={() => nav(`/timeblocks/${blockId}/edit`)}
                        >
                            Edit Time Block
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
export default SuccessfulTimeBlock;
