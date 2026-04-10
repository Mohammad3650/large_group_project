import { useNavigate } from 'react-router-dom';

function CalendarEventActions({ calendarEvent, handleDelete }) {
    const navigate = useNavigate();

    const handleEdit = () => {
        navigate(`/timeblocks/${calendarEvent.id}/edit`)
    }

    const onDelete = () => {
        handleDelete(calendarEvent.id)
    }



    return (
        <>
            <button
                className="button"
                aria-label="Edit event"
                onClick={handleEdit}
            >
                Edit
            </button>
            <button
                className="button"
                aria-label="Delete event"
                onClick={onDelete}
            >
                Delete
            </button>
        </>
    );
}

export default CalendarEventActions;
