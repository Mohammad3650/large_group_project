import { useNavigate, useLocation } from 'react-router-dom';
import './stylesheets/SuccessfulTimeBlock.css';
import tickImage from '../../assets/TimeBlock/tick.png';

/**
 * Displays a success page after creating or editing a time block.
 *
 * @returns {JSX.Element}
 */
function SuccessfulTimeBlock() {
    const nav = useNavigate();
    const location = useLocation();

    const blockId = location.state?.id;
    const action = location.state?.action || 'created';
    const isEdited = action === 'edited';

    const buttons = [
        {
            label: 'New Task',
            className: 'go-time-block-btn',
            action: () => nav('/create-schedule'),
        },
        {
            label: 'Return To Dashboard',
            className: 'go-dashboard-btn',
            action: () => nav('/dashboard'),
        },
        {
            label: 'View in Calendar',
            className: 'go-calendar-btn',
            action: () => nav('/calendar'),
        },
    ];

    return (
        <div className="success-page">
            <div className="success-card">

                <h1 className="success-text">
                    Time Block {isEdited ? 'Updated' : 'Created'} Successfully
                </h1>

                <div className="tick-image">
                    <img
                        className="photo"
                        src={tickImage}
                        alt="Success tick icon"
                    />
                </div>

                <p className="success-subtext">
                    Your time block was {isEdited ? 'updated' : 'created'} successfully.
                    You can now return to your dashboard, view it in the calendar,
                    or create another one.
                </p>

                <div className="success-btns">
                    {buttons.map((btn) => (
                        <button
                            key={btn.label}
                            className={btn.className}
                            onClick={btn.action}
                        >
                            {btn.label}
                        </button>
                    ))}

                    {blockId && (
                        <button
                            className="edit-time-block-btn"
                            onClick={() => nav(`/time-blocks/${blockId}/edit`)}
                        >
                            Edit Task
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SuccessfulTimeBlock;