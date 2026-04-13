import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaTag, FaAlignLeft } from 'react-icons/fa';
import './stylesheets/CalendarEventModal.css';

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
 * Renders a single event detail row with an icon and value.
 *
 * @param {Object} props
 * @param {JSX.Element} props.icon - Icon shown next to the detail
 * @param {string} props.value - Text value of the detail
 * @returns {JSX.Element}
 */

function EventDetail({ icon, value }) {
    return (
        <div className="event-detail">
            <span className="event-detail-icon">{icon}</span>
            <span>{value}</span>
        </div>
    );
}

/**
 * Displays the custom event modal content for a calendar event.
 *
 * @param {Object} props
 * @param {Object} props.calendarEvent - The selected event data
 * @param {Function} props.eventButtons - Function that renders action buttons
 * @param {Function} props.handleDelete - Function for deleting an event
 * @returns {JSX.Element} Event modal UI
 */

function CalendarEventModal({ calendarEvent, eventButtons, handleDelete }) {
    const { title, date, startTime, endTime, location, blockType, description } = calendarEvent;

    const formattedDate = date ? formatDate(date) : 'No date';
    const timeRange = startTime && endTime ? `${startTime} - ${endTime}` : 'No time';

    return (
        <div className="event-modal-container">
            <div className="sx__event-modal__title">{title}</div>

            <div className="sx__event-modal__description">
                <EventDetail icon={<FaCalendarAlt />} value={formattedDate} />
                <EventDetail icon={<FaClock />} value={timeRange} />
                <EventDetail icon={<FaMapMarkerAlt />} value={location || 'No location'} />
                <EventDetail icon={<FaTag />} value={blockType || 'No category'} />
                <EventDetail icon={<FaAlignLeft />} value={description || 'No description'} />
            </div>

            <div className="buttons">
                {eventButtons ? eventButtons(calendarEvent, handleDelete) : null}
            </div>
        </div>
    );
}

export default CalendarEventModal;
