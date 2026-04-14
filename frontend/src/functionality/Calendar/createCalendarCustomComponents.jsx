import CalendarEventModal from './CalendarEventModal.jsx';

/**
 * Creates the custom component configuration for the Schedule-X calendar.
 *
 * @param {Function} eventButtons - Renders action buttons for a calendar event
 * @param {Function} handleDelete - Deletes a calendar event by id
 * @returns {Object} Configuration object that injects custom components
into the Schedule-X calendar, including the event modal renderer.
 */

function CreateCalendarCustomComponents(eventButtons, handleDelete) {
    return {
        eventModal: ({ calendarEvent }) => (
            <CalendarEventModal
                calendarEvent={calendarEvent}
                eventButtons={eventButtons}
                handleDelete={handleDelete}
            />
        )
    };
}

export default CreateCalendarCustomComponents;
