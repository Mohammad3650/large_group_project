import blockTypeIcon from "../../assets/CalendarEvent/block_type_icon.png";
import calendarIcon from "../../assets/calendar_icon.png";
import descriptionIcon from "../../assets/CalendarEvent/description_icon.png";
import locationIcon from "../../assets/CalendarEvent/location_icon.png";
import timeIcon from "../../assets/CalendarEvent/time_icon.png";

/**
 * Converts a date from ISO format (YYYY-MM-DD)
 * into British format (DD/MM/YYYY).
 *
 * @param {string} date - Date in ISO format
 * @returns {string} Date in DD/MM/YYYY format
 */
const formatDate = (date) => {
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
};

/**
 * Displays the custom event modal content
 * for a calendar event.
 *
 * @param {Object} props - Component props
 * @param {Object} props.calendarEvent - The selected event data
 * @param {Function} props.eventButtons - Function that renders action buttons
 * @param {Function} props.handleDelete - Function for deleting an event
 * @returns {JSX.Element} Event modal UI
 */
function CalendarEventModal({ calendarEvent, eventButtons, handleDelete }) {
  return (
    <div className="event-modal-container">
      {/* Event title */}
      <div className="sx__event-modal__title">{calendarEvent.title}</div>

      {/* Event details */}
      <div className="sx__event-modal__description">
        <div className="event-detail">
          <img src={calendarIcon} alt="Date" className="event-detail-icon" />
          <span>{formatDate(calendarEvent.date)}</span>
        </div>

        <div className="event-detail">
          <img src={timeIcon} alt="Time" className="event-detail-icon" />
          <span>
            {calendarEvent.startTime} - {calendarEvent.endTime}
          </span>
        </div>

        <div className="event-detail">
          <img
            src={locationIcon}
            alt="Location"
            className="event-detail-icon"
          />
          <span>{calendarEvent.location}</span>
        </div>

        <div className="event-detail">
          <img
            src={blockTypeIcon}
            alt="Block Type"
            className="event-detail-icon"
          />
          <span>{calendarEvent.blockType}</span>
        </div>

        <div className="event-detail">
          <img
            src={descriptionIcon}
            alt="Description"
            className="event-detail-icon"
          />
          <span>{calendarEvent.description}</span>
        </div>
      </div>

      {/* Render edit/delete buttons if provided */}
      <div className="buttons">
        {eventButtons ? eventButtons(calendarEvent, handleDelete) : null}
      </div>
    </div>
  );
}

export default CalendarEventModal;
