import '@schedule-x/theme-default/dist/index.css';
import 'temporal-polyfill/global';
import './stylesheets/Calendar.css';

import useTimeBlocks from '../../utils/Hooks/useTimeBlocks.js';
import WelcomeMessage from '../../components/WelcomeMessage.jsx';
import CalendarView from './CalendarView.jsx';
import AddTaskButton from '../../components/AddTaskButton.jsx';
import useUsername from '../../utils/Hooks/useUsername.js';
import CalendarPlaceholder from './CalendarPlaceholder.jsx';
import CalendarEventActions from './CalendarEventActions.jsx';

/**
 * Renders the empty calendar state.
 *
 * @param {Object} props
 * @param {string} props.username - Current user's username
 * @returns {JSX.Element} Empty calendar state
 */

function CalendarEmptyState({ username }) {
    return (
        <div className="calendar-content">
            <WelcomeMessage page="calendar" username={username} />
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
 * @returns {JSX.Element} Calendar page UI
 */

function Calendar() {
    const { blocks, setBlocks } = useTimeBlocks();
    const { username } = useUsername(true);

    if (blocks === null) return <CalendarPlaceholder />;

    if (blocks.length === 0) {
        return <CalendarEmptyState username={username} />;
    }

    return (
        <CalendarView
            blocks={blocks}
            setBlocks={setBlocks}
            username={username}
            headerButtons={<AddTaskButton />}
            eventButtons={renderEventActions}
        />
    );
}

export default Calendar;
