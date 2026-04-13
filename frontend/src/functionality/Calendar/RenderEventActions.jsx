import CalendarEventActions from './CalendarEventActions.jsx';

/**
 * Renders the action buttons for a calendar event.
 *
 * @param {Object} calendarEvent - Selected calendar event
 * @param {Function} handleDelete - Deletes the selected event
 * @returns {JSX.Element} Event action buttons
 */

function renderEventActions(calendarEvent, handleDelete) {
    return <CalendarEventActions calendarEvent={calendarEvent} handleDelete={handleDelete} />;
}

export default renderEventActions;
