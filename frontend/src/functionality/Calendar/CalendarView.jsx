import { createViewMonthGrid, createViewWeek } from "@schedule-x/calendar";
import { ScheduleXCalendar, useCalendarApp } from "@schedule-x/react";
import { createEventModalPlugin } from "@schedule-x/event-modal";
import { createEventsServicePlugin } from "@schedule-x/events-service";
import { useState } from "react";
import '@schedule-x/theme-default/dist/index.css'
import 'temporal-polyfill/global'
import "./stylesheets/Calendar.css"

import blockTypeIcon from "../../assets/CalendarEvent/block_type_icon.png"
import calendarIcon from "../../assets/calendar_icon.png"
import descriptionIcon from "../../assets/CalendarEvent/description_icon.png"
import locationIcon from "../../assets/CalendarEvent/location_icon.png"
import timeIcon from "../../assets/CalendarEvent/time_icon.png"
import Navbar from "../../components/Navbar.jsx";
import deleteTimeBlock from "../../utils/deleteTimeBlock.js";
import getUserTimezone from "../../utils/getUserTimezone.js";


/**
 * Formats a date string from ISO format into British date format.
 *
 * @param {string} date - Date string in ISO format (e.g. "2026-02-19")
 * @returns {string} Formatted date string in British format (e.g. "19/02/2026")
 */
const formatDate = (date) => {
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
};

function CalendarView({ blocks, setBlocks, title, headerButtons, eventButtons }) {
    const eventsService = useState(() => createEventsServicePlugin())[0];
    const calendarTimezone = getUserTimezone()

    const calendar = useCalendarApp({
        views: [createViewWeek(), createViewMonthGrid()],
        plugins: [createEventModalPlugin(), eventsService],
        events: blocks,
        timezone: calendarTimezone,
        selectedDate: Temporal.Now.plainDateISO(calendarTimezone),
    });

    function handleDelete(id) {
        if (!confirm("Are you sure you want to delete this event?")) return;
        deleteTimeBlock(id)
            .then(() => {
                eventsService.remove(id);
                setBlocks(b => b.filter(block => block.id !== id));
            })
            .catch(err => console.error("Failed to delete", err));
    }

    const customComponents = {
        eventModal: ({ calendarEvent }) => (
            <div style={{ padding: "40px", color: "black", borderRadius: "10px", border: "1px solid black" }}>
                <div className="sx__event-modal__title">{calendarEvent.title}</div>
                <div className="sx__event-modal__description">
                    <div className="event-detail">
                        <img src={calendarIcon} alt="Date" className="event-detail-icon" />
                        <span>{formatDate(calendarEvent.date)}</span>
                    </div>
                    <div className="event-detail">
                        <img src={timeIcon} alt="Time" className="event-detail-icon" />
                        <span>{calendarEvent.startTime} - {calendarEvent.endTime}</span>
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
                <div className="buttons">
                    {eventButtons ? eventButtons(calendarEvent, handleDelete) : null}
                </div>
            </div>
        )
    };

    return (
        <>
            <Navbar/>
            <div className="calendar-content">
                <h1>{title}</h1>
                {headerButtons}
                <div className="actual-calendar sx-react-calendar-wrapper">
                    <ScheduleXCalendar calendarApp={calendar} customComponents={customComponents} />
                </div>
            </div>
        </>
    );
}

export default CalendarView;