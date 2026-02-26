import { createViewDay, createViewMonthGrid, createViewWeek } from "@schedule-x/calendar";
import { ScheduleXCalendar, useCalendarApp } from "@schedule-x/react";
import '@schedule-x/theme-default/dist/index.css'
import 'temporal-polyfill/global'

import "./calendar.css"

function Calendar() {
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
        }
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
    <div className="maindiv">
        <header className="header"></header>
        <h1 className="title">Calendar</h1>
        <div className="actual-calendar">
      <ScheduleXCalendar calendarApp={calendar} />
      </div>
    </div>
  );
}

export default Calendar;
