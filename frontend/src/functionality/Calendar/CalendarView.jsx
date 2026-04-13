import { createEventsServicePlugin } from '@schedule-x/events-service';
import CreateCalendarCustomComponents from './CreateCalendarCustomComponents.jsx';
import '@schedule-x/theme-default/dist/index.css';
import 'temporal-polyfill/global';
import createCalendarDeleteHandler from './utils/Helpers/createCalendarDeleteHandler.js';
import { useState } from 'react';
import CalendarRenderer from './CalendarRenderer.jsx';
import './stylesheets/CalendarView.css';
import './stylesheets/CalendarThemeOverrides.css';
import getUserTimezone from '../../utils/Helpers/getUserTimezone.js';
import WelcomeMessage from '../../components/WelcomeMessage.jsx';

/**
 * Displays the calendar view and wires together calendar state,
 * event handlers, and rendering components.
 *
 * @param {Object} props
 * @param {Array<Object>} props.blocks - Array of calendar event objects
 * @param {Function} props.setBlocks - State setter for updating calendar events
 * @param {string} props.username - Current user's username
 * @param {JSX.Element} props.headerButtons - Elements rendered above the calendar (e.g. action buttons)
 * @param {Function} props.eventButtons - Function used to render event action buttons
 * @returns {JSX.Element} The complete calendar interface including the welcome message, action buttons, and rendered calendar.
 */

function CalendarView({ blocks, setBlocks, username, headerButtons, eventButtons }) {
    const [eventsService] = useState(() => createEventsServicePlugin());
    const [calendarKey, setCalendarKey] = useState(0);
    const calendarTimezone = getUserTimezone();
    const handleDelete = createCalendarDeleteHandler(eventsService, setBlocks, setCalendarKey);
    const customComponents = CreateCalendarCustomComponents(eventButtons, handleDelete);

    return (
        <div className="calendar-content">
            <WelcomeMessage page="calendar" username={username} />
            {headerButtons}
            <div className="actual-calendar">
                <CalendarRenderer
                    key={calendarKey}
                    blocks={blocks}
                    calendarTimezone={calendarTimezone}
                    customComponents={customComponents}
                    eventsService={eventsService}
                />
            </div>
        </div>
    );
}

export default CalendarView;
