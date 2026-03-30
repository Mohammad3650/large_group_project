import { createViewDay, createViewMonthGrid, createViewWeek, createViewMonthAgenda } from '@schedule-x/calendar';
import { ScheduleXCalendar, useCalendarApp } from '@schedule-x/react';
import { createEventModalPlugin } from '@schedule-x/event-modal';
import { createEventsServicePlugin } from '@schedule-x/events-service';
import { useState, useMemo } from 'react';
import { customComponents } from './CustomComponents.jsx';
import '@schedule-x/theme-default/dist/index.css';
import 'temporal-polyfill/global';
import './stylesheets/Calendar.css';

import blockTypeIconLight from '../../assets/CalendarEvent/block_type_icon.png';
import blockTypeIconDark from '../../assets/CalendarEvent/block_type_icon_black.png';

import calendarIconLight from '../../assets/calendar_icon.png';
import calendarIconDark from '../../assets/calendar_icon_black.png';

import descriptionIconLight from '../../assets/CalendarEvent/description_icon.png';
import descriptionIconDark from '../../assets/CalendarEvent/description_icon_black.png';

import locationIconLight from '../../assets/CalendarEvent/location_icon.png';
import locationIconDark from '../../assets/CalendarEvent/location_icon_black.png';

import timeIconLight from '../../assets/CalendarEvent/time_icon.png';
import timeIconDark from '../../assets/CalendarEvent/time_icon_black.png';

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

function CalendarView({ blocks, setBlocks, title, headerButtons, eventButtons }) {
    const eventsService = useState(() => createEventsServicePlugin())[0];
    const [calendarKey, setCalendarKey] = useState(0);
    const calendarTimezone = getUserTimezone();

    const isDark = document.body.classList.contains('dark-theme');

    const blockTypeIcon = isDark ? blockTypeIconDark : blockTypeIconLight;
    const calendarIcon = isDark ? calendarIconDark : calendarIconLight;
    const descriptionIcon = isDark ? descriptionIconDark : descriptionIconLight;
    const locationIcon = isDark ? locationIconDark : locationIconLight;
    const timeIcon = isDark ? timeIconDark : timeIconLight;

    const icons = {
        calendarIcon,
        timeIcon,
        locationIcon,
        blockTypeIcon,
        descriptionIcon
    };

    function confirmDelete() {
        return confirm('Are you sure you want to delete this event?');
    }

    /**
     * Deletes a time block from the backend and updates the calendar UI.
     */
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
    const components = customComponents(eventButtons, handleDelete, icons);
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
