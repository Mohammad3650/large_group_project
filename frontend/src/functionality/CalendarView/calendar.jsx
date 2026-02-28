import {
  createViewDay,
  createViewMonthGrid,
  createViewWeek,
} from "@schedule-x/calendar";
import { ScheduleXCalendar, useCalendarApp } from "@schedule-x/react";

// import 'temporal-polyfill/global'
// import {Temporal } from "temporal-polyfill"

import { createEventModalPlugin } from "@schedule-x/event-modal";
import "./calendar.css";

import { useMemo } from "react";
import '@schedule-x/theme-default/dist/index.css'
import 'temporal-polyfill/global'
import NavBar from "../LandingPage/NavBar.jsx";

import {useEffect, useState} from "react";
import {api} from "../../api.js";


 

const customComponents = {
  eventModal: ({ calendarEvent }) => {
    return (
      <div className=""
        style={{
          padding: "40px",
          // background: "yellow",
          color: "black",
          borderRadius: "10px",
          border: "1px solid black",
          fontSize: "24px",
          fontWeight: "bold",
        }}
      >
        <div className="sx__event-modal__title">
        {calendarEvent.title}
        </div>


        <div className="sx__event-modal__description">
        {calendarEvent.description}
        </div>

        <div className="buttons">
            <button className="button">Edit</button>
            <button className="button">Delete</button>
          </div>

      </div>
    );
  },
}






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

  

    const calendar = useCalendarApp({
        views:[ createViewWeek(), createViewMonthGrid(),  ],
        plugins: [createEventModalPlugin()],
        events: [
            {
                id: 1,
                title: "event1",
                start: Temporal.ZonedDateTime.from("2024-12-12T10:00[Europe/London]"),
                end: Temporal.ZonedDateTime.from("2024-12-12T12:00[Europe/London]"),
                // description: "skkljashdjkfsdjkskajfkdjjksd;f;ajklfsfjklasfkdjl;ldjf",
            },
            ...events,
        ],
        selectedDate: Temporal.PlainDate.from("2024-12-12"),
        // plugins:
        // [
        //     createEventModalPlugin(),
        //     createDragAndDropPlugin(),
        // ]
        
    })































  // const customComponents = {};

  return (
    <div className="calendardiv">
      <NavBar/>
      
      {/* <h1 className="title">Calendar</h1> */}
      <div className="actual-calendar sx-react-calendar-wrapper">
        <ScheduleXCalendar calendarApp={calendar} customComponents={customComponents} />
      </div>
    </div>
  );
}

export default Calendar;
