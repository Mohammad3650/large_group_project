import { createViewDay, createViewMonthGrid, createViewWeek } from '@schedule-x/calendar';
import { ScheduleXCalendar, useCalendarApp } from '@schedule-x/react';
import { createEventModalPlugin } from '@schedule-x/event-modal';
import { createEventsServicePlugin } from '@schedule-x/events-service';
import { useState, useMemo } from 'react';
import { createCalendarCustomComponents } from './createCalendarCustomComponents.jsx';
import '@schedule-x/theme-default/dist/index.css';
import 'temporal-polyfill/global';
import './stylesheets/CalendarView.css';
import './stylesheets/CalendarThemeOverrides.css';
import deleteTimeBlock from '../../utils/Api/deleteTimeBlock.js';
import getUserTimezone from '../../utils/Helpers/getUserTimezone.js';

/**
 * Renders the Schedule-X calendar with configured views, plugins,
 * timezone, and custom modal components.
 *
 * @param {Object} props
 * @param {Array<Object>} props.blocks - Array of calendar event objects
 * @param {string} props.calendarTimezone - User timezone
 * @param {Object} props.customComponents - Custom modal/calendar components
 * @param {Object} props.eventsService - Schedule-X events service plugin
 * @returns {JSX.Element}
 */

function CalendarRenderer({ blocks, calendarTimezone, customComponents, eventsService }) {
    const eventModalPlugin = useMemo(() => createEventModalPlugin(), []);

    const calendar = useCalendarApp({
        views: [createViewDay(), createViewWeek(), createViewMonthGrid()],
        plugins: [eventModalPlugin, eventsService],
        events: Array.isArray(blocks) ? blocks : [],
        timezone: calendarTimezone,
        selectedDate: Temporal.Now.plainDateISO(calendarTimezone),
        isResponsive: false
    });

    return <ScheduleXCalendar calendarApp={calendar} customComponents={customComponents} />;
}

/**
 * Prompts the user to confirm deletion of a calendar event.
 *
 * @returns {boolean} True if the user confirms deletion, otherwise false
 */

function confirmEventDeletion() {
    return confirm('Are you sure you want to delete this event?');
}

/**
 * Removes a deleted event from the calendar service and local state,
 * and triggers a calendar rerender.
 *
 * @param {string|number} id - Unique identifier of the deleted event
 * @param {Object} eventsService - Schedule-X events service plugin instance
 * @param {Function} setBlocks - State setter for updating calendar events
 * @param {Function} setCalendarKey - State setter used to force calendar rerender
 * @returns {void}
 */
function removeDeletedEvent(id, eventsService, setBlocks, setCalendarKey) {
    eventsService.remove(id);
    setBlocks((block) => block.filter((block) => block.id !== id));
    setCalendarKey((key) => key + 1);
}

/**
 * Logs an error when deleting a calendar event fails.
 *
 * @param {string|number} id - Unique identifier of the event that failed to delete
 * @param {Error} error - Error object returned from the failed delete operation
 * @returns {void}
 */
function logDeleteFailure(id, error) {
    console.error('Failed to delete event with ID', id, error);
}

/**
 * Creates a handler function for deleting calendar events.
 * The handler confirms deletion, calls the delete API,
 * updates local state on success, and logs errors on failure.
 *
 * @param {Object} eventsService - Schedule-X events service plugin instance
 * @param {Function} setBlocks - State setter for updating calendar events
 * @param {Function} setCalendarKey - State setter used to force calendar rerender
 * @returns {Function} Handler that deletes a calendar event by id
 */
function createDeleteHandler(eventsService, setBlocks, setCalendarKey) {
    return (id) => {
        if (!confirmEventDeletion()) return;
        deleteTimeBlock(id)
            .then(() => removeDeletedEvent(id, eventsService, setBlocks, setCalendarKey))
            .catch((error) => logDeleteFailure(id, error));
    };
}

/**
 * Displays the calendar view and wires together calendar state,
 * event handlers, and rendering components.
 *
 * @param {Object} props
 * @param {Array<Object>} props.blocks - Array of calendar event objects
 * @param {Function} props.setBlocks - State setter for updating calendar events
 * @param {string} props.title - Title displayed above the calendar
 * @param {JSX.Element} props.headerButtons - Elements rendered above the calendar (e.g. action buttons)
 * @param {Function} props.eventButtons - Function used to render event action buttons
 * @returns {JSX.Element} Complete calendar view component
 */

function CalendarView({ blocks, setBlocks, title, headerButtons, eventButtons }) {
    const [eventsService] = useState(() => createEventsServicePlugin());
    const [calendarKey, setCalendarKey] = useState(0);
    const calendarTimezone = getUserTimezone();
    const handleDelete = createDeleteHandler(eventsService, setBlocks, setCalendarKey);
    const customComponents = createCalendarCustomComponents(eventButtons, handleDelete);

    return (
        <div className="calendar-content">
            <h1 className="welcome-message">{title}</h1>
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
