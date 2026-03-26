import "@schedule-x/theme-default/dist/index.css";
import "temporal-polyfill/global";
import "./stylesheets/Calendar.css";

import useTimeBlocks from "../../utils/useTimeBlocks.js";
import CalendarView from "./CalendarView.jsx";
import AddTaskButton from "../../components/AddTaskButton.jsx";
import useUsername from "../../utils/useUsername.js";
import { useNavigate } from "react-router-dom";
import CalendarPlaceholder from "./CalendarPlaceholder.jsx";

/**
 * Calendar Component
 *
 * Main calendar view for displaying and managing time blocks.
 * Fetches user-specific data via custom hooks (time blocks, username).
 * Passes data and actions to CalendarView for rendering.
 * Handles navigation (edit) and deletion of events.
 * Displays a placeholder while data is loading.
 *
 */

function Calendar() {

  // Custom hook for fetching and updating time blocks
  const { blocks, setBlocks } = useTimeBlocks();
  // Fetches the current user's username
  const username = useUsername(true);
  //Navigation for routing
  const nav = useNavigate();

  if (blocks === null) return <CalendarPlaceholder />;

  return (
    <CalendarView
      //Data passed into calendar
      blocks={blocks}
      setBlocks={setBlocks}
      //Dynamic title for each user
      title={`Welcome to your calendar, ${username}!`}
      headerButtons={<AddTaskButton />}
      eventButtons={(calendarEvent, handleDelete) => (
        <>
          {/* Navigate to edit page for selected event */}

          <button
            className="button"
            onClick={() => nav(`/timeblocks/${calendarEvent.id}/edit`)}
          >
            Edit
          </button>
          {/* Delete event using handler from CalendarView */}

          <button
            className="button"
            onClick={() => handleDelete(calendarEvent.id)}
          >
            Delete
          </button>
        </>
      )}
    />
  );
}

export default Calendar;
