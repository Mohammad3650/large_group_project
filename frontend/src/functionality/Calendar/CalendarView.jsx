import { createViewMonthGrid, createViewWeek } from "@schedule-x/calendar";
import { ScheduleXCalendar, useCalendarApp } from "@schedule-x/react";
import { createEventModalPlugin } from "@schedule-x/event-modal";
import { createEventsServicePlugin } from "@schedule-x/events-service";
import { useState } from "react";
import {useNavigate} from "react-router-dom";
import { api } from "../../api.js";
import '@schedule-x/theme-default/dist/index.css'
import 'temporal-polyfill/global'
import "./stylesheets/Calendar.css"

import blockTypeIcon from "../../assets/CalendarEvent/block_type_icon.png"
import calendarIcon from "../../assets/calendar_icon.png"
import descriptionIcon from "../../assets/CalendarEvent/description_icon.png"
import locationIcon from "../../assets/CalendarEvent/location_icon.png"
import timeIcon from "../../assets/CalendarEvent/time_icon.png"
import formatDate from "../../utils/formatDate.js";
import Navbar from "../../components/Navbar.jsx";
import AddTaskButton from "../../components/AddTaskButton.jsx";
import useUsername from "../../utils/useUsername.js";

function CalendarView({ blocks, setBlocks }) {
    const eventsService = useState(() => createEventsServicePlugin())[0];
    const username = useUsername(true);
    const nav = useNavigate();

    const calendar = useCalendarApp({
        views: [createViewWeek(), createViewMonthGrid()],
        plugins: [createEventModalPlugin(), eventsService],
        events: blocks,
        selectedDate: Temporal.Now.plainDateISO(),
    });

    function handleDelete(id) {
        if (!confirm("Are you sure you want to delete this event?")) return;
        api.delete(`/api/time-blocks/${id}/`)
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
                    <button className="button" onClick={() => nav(`/timeblocks/${calendarEvent.id}/edit`)}>Edit</button>
                    <button className="button" onClick={() => handleDelete(calendarEvent.id)}>Delete</button>
                </div>
            </div>
        )
    };

    return (
        <>
            <Navbar/>
            <div className="calendar-content">
                <h1>Welcome to your calendar, {username}!</h1>
                <AddTaskButton/>
                <div className="actual-calendar sx-react-calendar-wrapper">
                    <ScheduleXCalendar calendarApp={calendar} customComponents={customComponents} />
                </div>
            </div>
        </>
    );
}

export default CalendarView