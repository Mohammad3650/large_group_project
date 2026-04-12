import CalendarEventModal from './CalendarEventModal.jsx';

/**
 * Creates the custom component configuration for the Schedule-X calendar.
 *
 * @param {Function} eventButtons - Renders action buttons for a calendar event
 * @param {Function} handleDelete - Deletes a calendar event by id
 * @returns {Object} Schedule-X custom component configuration
 */

export const createCalendarCustomComponents = (eventButtons, handleDelete) => ({
    eventModal: ({ calendarEvent }) => (
        <CalendarEventModal
            calendarEvent={calendarEvent}
            eventButtons={eventButtons}
            handleDelete={handleDelete}
        />
    )
});