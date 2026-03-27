import { createViewMonthGrid, createViewWeek } from '@schedule-x/calendar';
import { ScheduleXCalendar, useCalendarApp } from '@schedule-x/react';
import { createEventModalPlugin } from '@schedule-x/event-modal';
import { createEventsServicePlugin } from '@schedule-x/events-service';
import { useState, useMemo } from 'react';
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

import deleteTimeBlock from '../../utils/deleteTimeBlock.js';
import getUserTimezone from '../../utils/getUserTimezone.js';

/**
 * CalendarView Component
 *
 * Renders the main calendar interface using Schedule-X.
 * Handles event display, deletion, and integration with custom modal components.
 *
 * @param {string} date - Date string in ISO format (e.g. "2026-02-19")
 * @returns {string} Formatted date string in British format (e.g. "19/02/2026")
 */
const formatDate = (date) => {
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
};

/**
 * Renders the Schedule-X calendar with the configured views, plugins,
 * timezone, and custom modal components.
 */
function CalendarRenderer({ blocks, calendarTimezone, customComponents, eventsService }) {
    const eventModalPlugin = useMemo(() => createEventModalPlugin(), []);

    const calendar = useCalendarApp({
        views: [createViewWeek(), createViewMonthGrid()],
        plugins: [eventModalPlugin, eventsService],
        events: Array.isArray(blocks) ? blocks : [],
        timezone: calendarTimezone,
        selectedDate: Temporal.Now.plainDateISO(calendarTimezone)
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

    const customComponents = {
        eventModal: ({ calendarEvent }) => (
            <div className="calendar-event-modal">
                <div className="sx__event-modal__title">{calendarEvent.title}</div>
                <div className="sx__event-modal__description">
                    <div className="event-detail">
                        <img src={calendarIcon} alt="Date" className="event-detail-icon" />
                        <span>{formatDate(calendarEvent.date)}</span>
                    </div>
                    <div className="event-detail">
                        <img src={timeIcon} alt="Time" className="event-detail-icon" />
                        <span>
                            {calendarEvent.startTime} - {calendarEvent.endTime}
                        </span>
                    </div>
                    <div className="event-detail">
                        <img src={locationIcon} alt="Location" className="event-detail-icon" />
                        <span>{calendarEvent.location}</span>
                    </div>
                    <div className="event-detail">
                        <img src={blockTypeIcon} alt="Block Type" className="event-detail-icon" />
                        <span>{calendarEvent.blockType}</span>
                    </div>
                    <div className="event-detail">
                        <img src={descriptionIcon} alt="Description" className="event-detail-icon" />
                        <span>{calendarEvent.description}</span>
                    </div>
                </div>
                <div className="buttons">{eventButtons ? eventButtons(calendarEvent, handleDelete) : null}</div>
            </div>
        )
    };

    return (
        <div className="calendar-content">
            <h1>{title}</h1>
            {headerButtons}
            <div className="actual-calendar">
                <CalendarRenderer key={calendarKey} blocks={blocks} calendarTimezone={calendarTimezone} customComponents={customComponents} eventsService={eventsService} />
            </div>
        </div>
    );
}

export default CalendarView;
