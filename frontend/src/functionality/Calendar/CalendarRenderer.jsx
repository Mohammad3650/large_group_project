import { createViewDay, createViewMonthGrid, createViewWeek } from '@schedule-x/calendar';
import { ScheduleXCalendar, useCalendarApp } from '@schedule-x/react';
import { createEventModalPlugin } from '@schedule-x/event-modal';
import { useMemo } from 'react';

/**
 * Renders the Schedule-X calendar with configured views, plugins,
 * timezone, and custom modal components.
 *
 * @param {Object} props
 * @param {Array<Object>} props.blocks - Array of calendar event objects
 * @param {string} props.calendarTimezone - User timezone
 * @param {Object} props.customComponents - Custom modal/calendar components
 * @param {Object} props.eventsService - Schedule-X events service plugin
 * @returns {JSX.Element} A fully configured Schedule-X calendar instance
with the provided events, plugins, and custom components.
 */

function CalendarRenderer({ blocks, calendarTimezone, customComponents, eventsService }) {
    const eventModalPlugin = useMemo(() => createEventModalPlugin(), []);
    const isMobile = window.innerWidth <= 768;

    const calendar = useCalendarApp({
        views: [createViewDay(), createViewWeek(), createViewMonthGrid()],
        defaultView: isMobile ? 'day' : 'week',
        plugins: [eventModalPlugin, eventsService],
        events: Array.isArray(blocks) ? blocks : [],
        timezone: calendarTimezone,
        selectedDate: Temporal.Now.plainDateISO(calendarTimezone),
        isResponsive: false
    });

    return <ScheduleXCalendar calendarApp={calendar} customComponents={customComponents} />;
}

export default CalendarRenderer;
