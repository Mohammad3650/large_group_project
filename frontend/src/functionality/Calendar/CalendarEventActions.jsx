import { useNavigate } from 'react-router-dom';
import './stylesheets/CalendarEventActions.css';

/**
 * Component that renders Edit and Delete buttons for a calendar event.
 *
 * @param {Object} props
 * @param {Object} props.calendarEvent - The event object containing event details (must include id)
 * @param {Function} props.handleDelete - Function to handle deleting the event
 * @returns {JSX.Element}
 */

function CalendarEventActions({ calendarEvent: { id }, handleDelete }) {
    const navigate = useNavigate();

    const handleEdit = () => {
        navigate(`/timeblocks/${id}/edit`);
    };

    const handleDeleteClick = () => {
        handleDelete(id);
    };

    return (
        <>
            <button className="button" aria-label="Edit event" onClick={handleEdit}>
                Edit
            </button>
            <button className="button" aria-label="Delete event" onClick={handleDeleteClick}>
                Delete
            </button>
        </>
    );
}

export default CalendarEventActions;
