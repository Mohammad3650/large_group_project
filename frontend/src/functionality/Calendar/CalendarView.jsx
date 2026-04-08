import { createViewDay, createViewMonthGrid, createViewWeek } from '@schedule-x/calendar';
import { ScheduleXCalendar, useCalendarApp } from '@schedule-x/react';
import { createEventModalPlugin } from '@schedule-x/event-modal';
import { createEventsServicePlugin } from '@schedule-x/events-service';
import { useState, useMemo } from 'react';
import { customComponents } from './CustomComponents.jsx';
import '@schedule-x/theme-default/dist/index.css';
import 'temporal-polyfill/global';
import './stylesheets/Calendar.css';
import deleteTimeBlock from '../../utils/Api/deleteTimeBlock.js';
import getUserTimezone from '../../utils/Helpers/getUserTimezone.js';

/**
 * Renders the Schedule-X calendar with the configured views, plugins,
 * timezone, and custom modal components.
 */
function CalendarRenderer({ blocks, calendarTimezone, customComponents, eventsService }) {
    const eventModalPlugin = useMemo(() => createEventModalPlugin(), []);

    const calendar = useCalendarApp({
        views: [
            createViewDay(),
            createViewWeek(),
            createViewMonthGrid(),
        ],
        plugins: [eventModalPlugin, eventsService],
        events: Array.isArray(blocks) ? blocks : [],
        timezone: calendarTimezone,
        selectedDate: Temporal.Now.plainDateISO(calendarTimezone),
        isResponsive: false,
    });

    return <ScheduleXCalendar calendarApp={calendar} customComponents={customComponents} />;
}

function CalendarView({ blocks, setBlocks, title, headerButtons, eventButtons, theme }) {
    const eventsService = useState(() => createEventsServicePlugin())[0];
    const [calendarKey, setCalendarKey] = useState(0);
    const calendarTimezone = getUserTimezone();

    function confirmDelete() {
        return confirm('Are you sure you want to delete this event?');
    }

    function handleDelete(id) {
        if (!confirmDelete()) return;

        deleteTimeBlock(id)
            .then(() => {
                eventsService.remove(id);
                setBlocks((b) => b.filter((block) => block.id !== id));
                setCalendarKey((k) => k + 1);
            })
            .catch((err) => console.error('Failed to delete event with ID', id, err));
    }

    const components = customComponents(eventButtons, handleDelete);

    return (
        <div className="calendar-content">
            <h1>{title}</h1>
            {headerButtons}
            <div className="actual-calendar">
                <CalendarRenderer key={calendarKey} blocks={blocks} calendarTimezone={calendarTimezone} customComponents={components} eventsService={eventsService} />
            </div>
        </div>
    );
}

export default CalendarView;
