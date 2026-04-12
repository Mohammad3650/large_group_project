import '@schedule-x/theme-default/dist/index.css';
import 'temporal-polyfill/global';
import './stylesheets/Calendar.css';

import useTimeBlocks from '../../utils/Hooks/useTimeBlocks.js';
import CalendarView from './CalendarView.jsx';
import AddTaskButton from '../../components/AddTaskButton.jsx';
import useUsername from '../../utils/Hooks/useUsername.js';
import CalendarPlaceholder from './CalendarPlaceholder.jsx';
import CalendarEventActions from './CalendarEventActions.jsx';

/**
 * Builds the page title for the calendar screen.
 *
 * @param {string} username - Current user's username
 * @returns {string} Calendar heading text
 */

function getCalendarTitle(username) {
    return `Welcome to your calendar, ${username}!`;
}

/**
 * Renders the empty calendar state.
 *
 * @param {Object} props
 * @param {string} props.title - Calendar page title
 * @returns {JSX.Element} Empty calendar state
 */

function CalendarEmptyState({ title }) {
    return (
        <div className="calendar-content">
            <h1>{title}</h1>
            <AddTaskButton />
            <div className="empty-state">No events yet.</div>
        </div>
    );
}

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

/**
 * Displays the user's calendar page.
 *
 * Fetches the user's time blocks and username, then renders either
 * a loading state, an empty state, or the populated calendar view.
 *
 * @param {Object} props
 * @param {string} props.theme - Current theme
 * @returns {JSX.Element} Calendar page UI
 */

function Calendar({ theme }) {
    const { blocks, setBlocks } = useTimeBlocks();
    const { username } = useUsername(true);

    const title = getCalendarTitle(username);

    if (blocks === null) return <CalendarPlaceholder />;

    if (blocks.length === 0) {
        return <CalendarEmptyState title={title} />;
    }

    return (
        <CalendarView
            blocks={blocks}
            setBlocks={setBlocks}
            theme={theme}
            title={title}
            headerButtons={<AddTaskButton />}
            eventButtons={renderEventActions}
        />
    );
}

export default Calendar;
