import { createViewMonthGrid, createViewWeek } from "@schedule-x/calendar";
import { ScheduleXCalendar, useCalendarApp } from "@schedule-x/react";
import { createEventModalPlugin } from "@schedule-x/event-modal";
import { createEventsServicePlugin } from "@schedule-x/events-service";
import '@schedule-x/theme-default/dist/index.css'
import 'temporal-polyfill/global'
import NavBar from "../LandingPage/NavBar.jsx";
import { useEffect, useState } from "react";
import { api } from "../../api.js";
import "./calendar.css"
import AddTaskButton from "../../components/AddTaskButton.jsx";


const formatDate = (date) => {
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
};

function Calendar() {
    const [blocks, setBlocks] = useState(null);

    useEffect(() => {
        async function fetchTimeBlocks() {
            try {
                const res = await api.get("/api/time-blocks/get/");
                const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                const timeBlocks = res.data.map(block => ({
                    id: block.id,
                    title: block.name,
                    start: Temporal.ZonedDateTime.from(`${block.date}T${(block.start_time || "00:00").slice(0, 5)}[${timezone}]`),
                    end: Temporal.ZonedDateTime.from(`${block.date}T${(block.end_time || "23:59").slice(0, 5)}[${timezone}]`),
                    date: block.date,
                    startTime: (block.start_time || "00:00").slice(0, 5),
                    endTime: (block.end_time || "23:59").slice(0, 5),
                    location: block.location || "N/A",
                    blockType: block.block_type.charAt(0).toUpperCase() + block.block_type.slice(1),
                    description: block.description || "N/A",
                }));
                setBlocks(timeBlocks);
            } catch (err) {
                console.error("Failed to load time blocks", err);
            }
        }
        fetchTimeBlocks();
    }, []);

    if (blocks === null) return (
        <div className="calendardiv">
            <NavBar/>
            <h1 className="title">Calendar</h1>
            <p>Loading...</p>
        </div>
    );

    return <CalendarView blocks={blocks} setBlocks={setBlocks} />;
}

function CalendarView({ blocks, setBlocks }) {
    const eventsService = useState(() => createEventsServicePlugin())[0];
    const [username, setUsername] = useState("");

    useEffect(() => {
        async function fetchUser() {
            try {
                const res = await api.get("/api/user/");
                setUsername(res.data.username);
            } catch (err) {
                console.error("Failed to load user", err);
            }
        }
        fetchUser();
    }, []);

    const calendar = useCalendarApp({
        views: [createViewWeek(), createViewMonthGrid()],
        plugins: [createEventModalPlugin(), eventsService],
        events: blocks,
        selectedDate: Temporal.Now.plainDateISO(),
});

    function handleDelete(id) {
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
                        <img src="/calendar.png" alt="Date" className="event-detail-icon" />
                        <span>{formatDate(calendarEvent.date)}</span>
                    </div>
                    <div className="event-detail">
                        <img src="/time.png" alt="Time" className="event-detail-icon" />
                        <span>{calendarEvent.startTime} - {calendarEvent.endTime}</span>
                    </div>
                    <div className="event-detail">
                        <img src="/location.png" alt="Location" className="event-detail-icon" />
                        <span>{calendarEvent.location}</span>
                    </div>
                    <div className="event-detail">
                        <img src="/block_type.png" alt="Block Type" className="event-detail-icon" />
                        <span>{calendarEvent.blockType}</span>
                    </div>
                    <div className="event-detail">
                        <img src="/description.png" alt="Description" className="event-detail-icon" />
                        <span>{calendarEvent.description}</span>
                    </div>
                </div>
                <div className="buttons">
                    <button className="button">Edit</button>
                    <button className="button" onClick={() => handleDelete(calendarEvent.id)}>Delete</button>
                </div>
            </div>
        )
    };

    return (
        <>
            <NavBar/>
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

export default Calendar;