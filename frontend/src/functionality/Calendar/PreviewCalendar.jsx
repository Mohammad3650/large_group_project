import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api.js";
import '@schedule-x/theme-default/dist/index.css'
import 'temporal-polyfill/global'
import "./stylesheets/Calendar.css"
import CalendarView from "./CalendarView.jsx";
import CalendarPlaceholder from "./CalendarPlaceholder.jsx";
import mapTimeBlocks from "../../utils/mapTimeBlocks.js";

function PreviewCalendar() {
    const [blocks, setBlocks] = useState(null);
    const [schedule, setSchedule] = useState(null);
    const nav = useNavigate();

    useEffect(() => {
        async function fetchTimeBlocks() {
            try {
                const stored = sessionStorage.getItem("generatedSchedule");

                const schedule = JSON.parse(stored);
                setSchedule(schedule);

                const events = schedule["events"];
                const scheduled = schedule["scheduled"];
                const combined = [...events, ...scheduled];
                setBlocks(mapTimeBlocks(combined));
            } catch (err) {
                console.error("Failed to load time blocks", err);
            }
        }
        fetchTimeBlocks();
    }, []);

    async function save() {
        const data = { week_start: schedule.week_start, events: schedule.events };
        await api.post("/api/plans/save/", data);
        nav("/dashboard");
    }

    function leave() {
        sessionStorage.removeItem("generatedSchedule");
        nav("/dashboard");
    }

    if (blocks === null) return <CalendarPlaceholder/>;

    return (
        <CalendarView
            blocks={blocks}
            setBlocks={setBlocks}
            title="Preview generated schedule"
            headerButtons={
                <>
                    <button onClick={save}>Save Schedule</button>
                    <button onClick={leave}>Cancel</button>
                </>
            }
            eventButtons={null}
        />
    );
}

export default PreviewCalendar;