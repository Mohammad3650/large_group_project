import '@schedule-x/theme-default/dist/index.css'
import 'temporal-polyfill/global'
import "./stylesheets/Calendar.css"

import useTimeBlocks from "../../utils/useTimeBlocks.js";
import CalendarView from "./CalendarView.jsx";
import AddTaskButton from "../../components/AddTaskButton.jsx";
import useUsername from "../../utils/useUsername.js";
import { useNavigate } from "react-router-dom";
import CalendarPlaceholder from "./CalendarPlaceholder.jsx";


function Calendar() {
    const { blocks, setBlocks } = useTimeBlocks();
    const username = useUsername(true);
    const nav = useNavigate();

    if (blocks === null) return <CalendarPlaceholder/>;

    return (
        <CalendarView
            blocks={blocks}
            setBlocks={setBlocks}
            title={`Welcome to your calendar, ${username}!`}
            headerButtons={<AddTaskButton/>}
            eventButtons={(calendarEvent, handleDelete) => (
                <>
                    <button className="button" onClick={() => nav(`/timeblocks/${calendarEvent.id}/edit`)}>Edit</button>
                    <button className="button" onClick={() => handleDelete(calendarEvent.id)}>Delete</button>
                </>
            )}
        />
    );}

export default Calendar;