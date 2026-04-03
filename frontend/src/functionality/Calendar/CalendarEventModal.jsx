import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaTag, FaAlignLeft } from 'react-icons/fa';

/**
 * Converts a date from ISO format (YYYY-MM-DD)
 * into British format (DD/MM/YYYY).
 *
 * @param {string} date - Date in ISO format
 * @returns {string} Date in DD/MM/YYYY format
 */
const formatDate = (date) => {
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
};

/**
 * Displays the custom event modal content for a calendar event.
 *
 * @param {Object} props.calendarEvent - The selected event data
 * @param {Function} props.eventButtons - Function that renders action buttons
 * @param {Function} props.handleDelete - Function for deleting an event
 * @returns {JSX.Element} Event modal UI
 */
function CalendarEventModal({ calendarEvent, eventButtons, handleDelete }) {
    return (
        <div className="event-modal-container">
            <div className="sx__event-modal__title">{calendarEvent.title}</div>

            <div className="sx__event-modal__description">
                <div className="event-detail">
                    <FaCalendarAlt className="event-detail-icon" />
                    <span>{formatDate(calendarEvent.date)}</span>
                </div>

                <div className="event-detail">
                    <FaClock className="event-detail-icon" />
                    <span>{calendarEvent.startTime} - {calendarEvent.endTime}</span>
                </div>

                <div className="event-detail">
                    <FaMapMarkerAlt className="event-detail-icon" />
                    <span>{calendarEvent.location}</span>
                </div>

                <div className="event-detail">
                    <FaTag className="event-detail-icon" />
                    <span>{calendarEvent.blockType}</span>
                </div>

                <div className="event-detail">
                    <FaAlignLeft className="event-detail-icon" />
                    <span>{calendarEvent.description}</span>
                </div>
            </div>

            <div className="buttons">{eventButtons ? eventButtons(calendarEvent, handleDelete) : null}</div>
        </div>
    );
}

export default CalendarEventModal;
