import '@schedule-x/theme-default/dist/index.css';
import 'temporal-polyfill/global';
import './stylesheets/Calendar.css';

import useTimeBlocks from '../../utils/Hooks/useTimeBlocks.js';
import WelcomeMessage from '../../components/WelcomeMessage.jsx';
import CalendarView from './CalendarView.jsx';
import AddTaskButton from '../../components/AddTaskButton.jsx';
import useUsername from '../../utils/Hooks/useUsername.js';
import { useNavigate } from 'react-router-dom';
import CalendarPlaceholder from './CalendarPlaceholder.jsx';

/**
 * Calendar Component
 *
 * Main calendar view for displaying and managing time blocks.
 * Fetches user-specific data via custom hooks (time blocks, username).
 * Passes data and actions to CalendarView for rendering.
 * Handles navigation (edit) and deletion of events.
 * Displays a placeholder while data is loading.
 *
 * @param {Object} props
 * @param {string} props.theme - Current theme ('light' or 'dark')
 */

function Calendar({ theme }) {
    // Custom hook for fetching and updating time blocks
    const { blocks, setBlocks } = useTimeBlocks();
    // Fetches the current user's username
    const { username } = useUsername(true);
    //Navigation for routing
    const nav = useNavigate();

    if (blocks === null) return <CalendarPlaceholder />;
    if (blocks.length === 0) {
        return (
            <div className="calendar-content">
                <WelcomeMessage page="calendar" username={username} />
                <div className="empty-state">No events yet.</div>
            </div>
        );
    }

    return (
        <CalendarView
            //Data passed into calendar
            blocks={blocks}
            setBlocks={setBlocks}
            theme={theme}
            //Dynamic title for each user
            title={`Welcome to your calendar, ${username}!`}
            headerButtons={<AddTaskButton />}
            eventButtons={(calendarEvent, handleDelete) => (
                <>
                    {/* Navigate to edit page for selected event */}

                    <button className="button" aria-label="Edit event" onClick={() => nav(`/time-blocks/${calendarEvent.id}/edit`)}>
                        Edit
                    </button>
                    {/* Delete event using handler from CalendarView */}

                    <button className="button" aria-label="Delete event" onClick={() => handleDelete(calendarEvent.id)}>
                        Delete
                    </button>
                </>
            )}
        />
    );
}

export default Calendar;
