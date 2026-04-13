import useCalendarEventActions from './utils/Hooks/useCalendarEventActions.js';
import './stylesheets/CalendarEventActions.css';

/**
 * Renders the action buttons displayed in the calendar event modal,
 * allowing the user to edit the selected event or delete it from the calendar.
 *
 * @param {Object} props
 * @param {Object} props.calendarEvent - The selected calendar event
 * @param {string|number} props.calendarEvent.id - Unique identifier of the selected event
 * @param {Function} props.handleDelete - Function used to delete the event
 * @returns {JSX.Element} A pair of buttons that allow the user to edit
 * or delete the currently selected calendar event.
 */

function CalendarEventActions({ calendarEvent, handleDelete }) {
    const { handleEdit, handleDeleteEvent } = useCalendarEventActions({
        calendarEvent,
        handleDelete
    });

    return (
        <>
            <button className="button" aria-label="Edit event" onClick={handleEdit}>
                Edit
            </button>
            <button className="button" aria-label="Delete event" onClick={handleDeleteEvent}>
                Delete
            </button>
        </>
    );
}

export default CalendarEventActions;
