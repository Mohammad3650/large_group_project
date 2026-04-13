import WelcomeMessage from '../../components/WelcomeMessage.jsx';
import AddTaskButton from '../../components/AddTaskButton.jsx';

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

export default CalendarEmptyState;