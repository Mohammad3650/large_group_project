import {
  createViewDay,
  createViewMonthGrid,
  createViewWeek,
} from "@schedule-x/calendar";
import { ScheduleXCalendar, useCalendarApp } from "@schedule-x/react";
import "@schedule-x/theme-default/dist/index.css";

// import 'temporal-polyfill/global'
// import {Temporal } from "temporal-polyfill"

import { createEventModalPlugin } from "@schedule-x/event-modal";
import "./calendar.css";
import { useMemo } from "react";



 
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

        {/* <div className="sx__event-modal__time">
        {calendarEvent.time}
        </div> */}


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

  const calendar = useCalendarApp({
    views: [
      createViewWeek(),
      createViewMonthGrid(),
      // createViewDay()
    ],
    plugins: [createEventModalPlugin()],
    events: [
      {
        id: 1,
        title: "Event1",
        start: Temporal.ZonedDateTime.from("2024-12-12T10:00[Europe/London]"),
        end: Temporal.ZonedDateTime.from("2024-12-12T12:00[Europe/London]"),
        description: "skkljashdjkfsdjkskajfkdjjksd;f;ajklfsfjklasfkdjl;ldjf",
      },

      
    ],
    selectedDate: Temporal.PlainDate.from("2024-12-12"),
  });

  // const customComponents = {};

  return (
    <div className="calendardiv">
      <header className="header"></header>
      <h1 className="title">Calendar</h1>
      <div className="actual-calendar sx-react-calendar-wrapper">
        <ScheduleXCalendar calendarApp={calendar} customComponents={customComponents} />
      </div>
    </div>
  );
}

export default Calendar;
