import { createViewMonthGrid, createViewWeek } from "@schedule-x/calendar";
import { ScheduleXCalendar, useCalendarApp } from "@schedule-x/react";
import { createEventModalPlugin } from "@schedule-x/event-modal";
import { createEventsServicePlugin } from "@schedule-x/events-service";
import { useMemo, useState } from "react";
import "@schedule-x/theme-default/dist/index.css";
import "temporal-polyfill/global";
import "./stylesheets/Calendar.css";

import Navbar from "../../components/Navbar.jsx";
import deleteTimeBlock from "../../utils/deleteTimeBlock.js";
import getUserTimezone from "../../utils/getUserTimezone.js";
import { customComponents } from "./CustomComponents.jsx";

/**
 * CalendarView Component
 *
 * Renders the main calendar interface using Schedule-X.
 * Handles event display, deletion, and integration with custom modal components.
 *
 * @param {Object} props - Component props
 * @param {Array} props.blocks - List of calendar events
 * @param {Function} props.setBlocks - State updater for events
 * @param {string} props.title - Title displayed above the calendar
 * @param {JSX.Element} props.headerButtons - Optional header buttons
 * @param {Function} props.eventButtons - Function to render event action buttons
 * @returns {JSX.Element} Rendered calendar view
 */
function CalendarRenderer({
  blocks,
  calendarTimezone,
  customComponents,
  eventsService,
}) {
  const eventModalPlugin = useMemo(() => createEventModalPlugin(), []);

  const calendar = useCalendarApp({
    views: [createViewWeek(), createViewMonthGrid()],
    plugins: [eventModalPlugin, eventsService],
    events: blocks,
    timezone: calendarTimezone,
    selectedDate: Temporal.Now.plainDateISO(calendarTimezone),
  });

  return (
    <ScheduleXCalendar
      calendarApp={calendar}
      customComponents={customComponents}
    />
  );
}

function CalendarView({
  blocks,
  setBlocks,
  title,
  headerButtons,
  eventButtons,
}) {
  const eventsService = useState(() => createEventsServicePlugin())[0];
  const [calendarKey, setCalendarKey] = useState(0);
  const calendarTimezone = getUserTimezone();

  /**
   * Deletes an event after confirmation,
   * then updates the calendar and local state.
   *
   * @param {string|number} id - ID of the event to delete
   */
  function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this event?")) return;
    deleteTimeBlock(id)
      .then(() => {
        eventsService.remove(id);
        setBlocks((b) => b.filter((block) => block.id !== id));
        setCalendarKey((k) => k + 1);
      })
      .catch((err) => console.error("Failed to delete", err));
  }

  return (
    <>
      <Navbar />
      <div className="calendar-content">
        <h1>{title}</h1>
        {headerButtons}
        <div className="actual-calendar sx-react-calendar-wrapper">
          <CalendarRenderer
            key={calendarKey}
            blocks={blocks}
            calendarTimezone={calendarTimezone}
            customComponents={customComponents(eventButtons, handleDelete)}
            eventsService={eventsService}
          />
        </div>
      </div>
    </>
  );
}

export default CalendarView;