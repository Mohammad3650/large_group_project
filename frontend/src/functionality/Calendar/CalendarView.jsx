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
 * @param {Array} props.blocks - Calendar event data
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
 * Creates the delete handler for calendar events.
 *
 * @param {Object} eventsService - Schedule-X events service plugin
 * @param {Function} setBlocks - Updates calendar blocks state
 * @param {Function} setCalendarKey - Forces calendar rerender when needed
 * @returns {Function} Delete handler for a calendar event id
 */

function createDeleteHandler(eventsService, setBlocks, setCalendarKey) {
    return (id) => {
        if (!confirm('Are you sure you want to delete this event?')) return;
        deleteTimeBlock(id)
            .then(() => {
                eventsService.remove(id);
                setBlocks((b) => b.filter((block) => block.id !== id));
                setCalendarKey((k) => k + 1);
            })
            .catch((err) => console.error('Failed to delete event with ID', id, err));
    };
}

/**
 * Displays the calendar view and wires calendar actions to the renderer.
 *
 * @param {Object} props
 * @param {Array} props.blocks - Calendar event data
 * @param {Function} props.setBlocks - Updates calendar blocks state
 * @param {string} props.title - Calendar page title
 * @param {JSX.Element} props.headerButtons - Buttons shown above the calendar
 * @param {Function} props.eventButtons - Function that renders event action buttons
 * @param {string} props.theme - Current theme
 * @returns {JSX.Element}
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
