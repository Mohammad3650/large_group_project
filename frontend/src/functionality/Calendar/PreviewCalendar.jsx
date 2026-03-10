import { createViewMonthGrid, createViewWeek, createViewDay } from "@schedule-x/calendar";
import { ScheduleXCalendar, useCalendarApp } from "@schedule-x/react";
import { createEventModalPlugin } from "@schedule-x/event-modal";
import { createEventsServicePlugin } from "@schedule-x/events-service";
import Navbar from "../../components/Navbar.jsx";
// import AddTaskButton from "../../components/AddTaskButton.jsx";
import useUser from "../../utils/useUser.js";
import { useEffect, useState } from "react";
import { api } from "../../api.js";
import '@schedule-x/theme-default/dist/index.css'
import 'temporal-polyfill/global'
import "./stylesheets/Calendar.css"
import {useNavigate} from "react-router-dom";

import blockTypeIcon from "../../assets/CalendarEvent/block_type_icon.png"
import calendarIcon from "../../assets/calendar_icon.png"
import descriptionIcon from "../../assets/CalendarEvent/description_icon.png"
import locationIcon from "../../assets/CalendarEvent/location_icon.png"
import timeIcon from "../../assets/CalendarEvent/time_icon.png"


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

function PreviewCalendar() {
    const [blocks, setBlocks] = useState(null);
    const [schedule, setSchedule] = useState(null);



    useEffect(() => {
        async function fetchTimeBlocks() {
            try {
                // const res = await api.get("/api/time-blocks/get/");
                const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

                const stored = sessionStorage.getItem("generatedSchedule");


                const schedule = JSON.parse(stored)
                setSchedule(schedule)

                const events = schedule["events"]
                const scheduled = schedule["scheduled"]
                const combined = [...events, ...scheduled]
                console.log(combined)

                const timeBlocks = combined.map((value, index) => ({
                    
                    id: index,
                    title: value.name,
                    start: Temporal.ZonedDateTime.from(`${value.date}T${(value.start_time || "00:00").slice(0, 5)}[${timezone}]`),
                    end: Temporal.ZonedDateTime.from(`${value.date}T${(value.end_time || "23:59").slice(0, 5)}[${timezone}]`),

                    date: value.date,
                    startTime: (value.start_time || "00:00").slice(0, 5),
                    endTime: (value.end_time || "23:59").slice(0, 5),
                    location: value.location || "N/A",
                    description: value.description || "N/A"

                }))

                setBlocks(timeBlocks);
            } catch (err) {
                console.error("Failed to load time blocks", err);
            }
        }
        fetchTimeBlocks();
    }, []);

    if (blocks === null) return (
        <div className="calendardiv">
            <Navbar/>
            <h1 className="title">Calendar: NULL</h1>
        </div>
    );

    return <CalendarView blocks={blocks} setBlocks={setBlocks} schedule={schedule} />;
}

function CalendarView({ blocks, setBlocks, schedule }) {
    const eventsService = useState(() => createEventsServicePlugin())[0];
    const username = useUser(true);
    const nav = useNavigate();

    const calendar = useCalendarApp({
        views: [createViewWeek(), createViewMonthGrid()],
        plugins: [createEventModalPlugin(), eventsService],
        events: blocks,
        selectedDate: Temporal.Now.plainDateISO(),
    });

    function leave() {
        sessionStorage.removeItem("generatedSchedule");
        nav("/dashboard")
    }

    async function save() {
        console.log("SENT:")
        

        const data = {week_start: schedule.week_start, events: schedule.events}
        console.log(data)

        const res = await api.post("/api/plans/save/", data);
        console.log(res)

        nav("/dashboard")
        
    }

    function handleDelete(id) {
        console.log("CANNOT DELETE GENERATED ITEMS")
        // if (!confirm("Are you sure you want to delete this event?")) return;
        // api.delete(`/api/time-blocks/${id}/`)
        //     .then(() => {
        //         eventsService.remove(id);
        //         setBlocks(b => b.filter(block => block.id !== id));
        //     })
        //     .catch(err => console.error("Failed to delete", err));
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
                    {/* <button className="button" onClick={() => nav(`/timeblocks/${calendarEvent.id}/edit`)}>Edit</button> */}
                    {/* <button className="button" onClick={() => handleDelete(calendarEvent.id)}>Delete</button> */}
                </div>
            </div>
        )
    };

    return (
        <>
            <Navbar/>
            <div className="calendar-content">
                <h1>Preview generated schedule</h1>

                <div className="calendar-sidebar">
                    <button onClick={save}>Save Schedule</button>
                    {/* <button>Regenerate</button> */}
                    <button onClick={leave}>Cancel</button>
                </div>

                <div className="actual-calendar sx-react-calendar-wrapper">
                    <ScheduleXCalendar calendarApp={calendar} customComponents={customComponents} />
                </div>
            </div>
        </>
    );
}

export default PreviewCalendar;