import CalendarEventModal from './CalendarEventModal.jsx';

export const customComponents = (eventButtons, handleDelete, icons) => ({
    eventModal: ({ calendarEvent }) => (
        <CalendarEventModal
            calendarEvent={calendarEvent}
            eventButtons={eventButtons}
            handleDelete={handleDelete}
        />
    )
});