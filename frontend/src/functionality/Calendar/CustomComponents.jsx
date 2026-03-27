import CalendarEventModal from './CalendarEventModal.jsx';

export const customComponents = (eventButtons, handleDelete) => ({
    eventModal: ({ calendarEvent }) => (
        <CalendarEventModal
            calendarEvent={calendarEvent}
            eventButtons={eventButtons}
            handleDelete={handleDelete}
        />
    )
});
