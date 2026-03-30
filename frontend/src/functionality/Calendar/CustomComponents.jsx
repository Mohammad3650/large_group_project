import CalendarEventModal from './CalendarEventModal.jsx';

export const customComponents = (eventButtons, handleDelete, icons) => ({
    eventModal: ({ calendarEvent }) => (
        <CalendarEventModal
            calendarEvent={calendarEvent}
            eventButtons={eventButtons}
            handleDelete={handleDelete}
            calendarIcon={icons.calendarIcon}
            timeIcon={icons.timeIcon}
            locationIcon={icons.locationIcon}
            blockTypeIcon={icons.blockTypeIcon}
            descriptionIcon={icons.descriptionIcon}
        />
    )
});