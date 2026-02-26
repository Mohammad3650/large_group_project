import { createViewDay, createViewMonthGrid, createViewWeek } from "@schedule-x/calendar";
import { ScheduleXCalendar, useCalendarApp } from "@schedule-x/react";
import '@schedule-x/theme-default/dist/index.css'
import 'temporal-polyfill/global'
import NavBar from "../LandingPage/NavBar.jsx";

import "./calendar.css"
import {useEffect, useState} from "react";
import {api} from "../../api.js";

function Calendar() {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        async function fetchTimeBlocks() {
            try {
                const res = await api.get("/api/time-blocks/get/");
                const blocks = res.data.map(block => ({
                    id: block.id,
                    title: block.name || block.block_type,
                    start: `${block.date} ${block.start_time?.slice(0, 5) || "00:00"}`,
                    end: `${block.date} ${block.end_time?.slice(0, 5) || "23:59"}`
                }));
                setEvents(blocks);
            } catch (err) {
                console.error("Failed to load time blocks", err);
            }
        }
        fetchTimeBlocks();
    }, []);

    console.log(events);

    const calendar = useCalendarApp({
        views:[
            createViewWeek(),
            createViewMonthGrid(),
            // createViewDay()
        ],

        events: [
            {
                id: 1,
                title: "event1",
                start: Temporal.PlainDate.from('2024-12-12'),
                end: Temporal.PlainDate.from('2024-12-12')
            },
            ...events,
        ],
        selectedDate: Temporal.PlainDate.from('2024-12-12'),
        // plugins:
        // [
        //     createEventModalPlugin(),
        //     createDragAndDropPlugin(),
        // ]
    })





    const customComponents =
        {

        }














    return (
        <>
            <div className="maindiv">
                <header className="header"></header>
                <h1 className="title">Calendar</h1>
                <div className="actual-calendar">
                    <ScheduleXCalendar calendarApp={calendar} />
                </div>
            </div>
        </>
    );
}

export default Calendar;
