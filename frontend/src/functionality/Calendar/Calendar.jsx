import '@schedule-x/theme-default/dist/index.css'
import 'temporal-polyfill/global'
import "./stylesheets/Calendar.css"

import Navbar from "../../components/Navbar.jsx";
import useTimeBlocks from "../../utils/useTimeBlocks.js";
import CalendarView from "./CalendarView.jsx";


function Calendar() {
    const { blocks, setBlocks } = useTimeBlocks();

    if (blocks === null) return (
        <div className="calendardiv">
            <Navbar/>
            <h1 className="title">Calendar</h1>
        </div>
    );

    return <CalendarView blocks={blocks} setBlocks={setBlocks} />;
}

export default Calendar;