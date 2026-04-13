import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaTag, FaAlignLeft } from 'react-icons/fa';
import './stylesheets/CalendarEventModal.css';
import EventDetail from './EventDetail.jsx';
import formatDate from './utils/Helpers/formatDate.js';

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
