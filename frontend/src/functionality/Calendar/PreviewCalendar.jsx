import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api.js';
import '@schedule-x/theme-default/dist/index.css';
import 'temporal-polyfill/global';
import './stylesheets/Calendar.css';
import CalendarView from './CalendarView.jsx';
import mapTimeBlocks from '../../utils/Helpers/mapTimeBlocks.js';
import savePlan from '../../utils/Api/savePlan.js';
import getUserTimezone from '../../utils/Helpers/getUserTimezone.js';

// Component for previewing a generated schedule before saving
function PreviewCalendar() {
    const [blocks, setBlocks] = useState(null);
    const [schedule, setSchedule] = useState(null);
    const nav = useNavigate();

    // Fetch and process the generated schedule from sessionStorage
    useEffect(() => {
        async function fetchTimeBlocks() {
            try {
                const stored = sessionStorage.getItem('generatedSchedule');

                const schedule = JSON.parse(stored);
                if (!schedule) return;
                setSchedule(schedule);

                const events = schedule['events'];
                const scheduled = schedule['scheduled'];
                const combined = [...events, ...scheduled];
                setBlocks(mapTimeBlocks(combined));
            } catch (err) {
                console.error('Failed to load time blocks', err);
            }
        }
        fetchTimeBlocks();
    }, []);

    // Save the schedule to the backend and navigate to dashboard
    async function save() {
        const timezone = getUserTimezone();
        const events = schedule.events.map((event) => {
            const startZdt = Temporal.ZonedDateTime.from(
                `${event.date}T${event.start_time}[UTC]`
            ).withTimeZone(timezone);
            const endZdt = Temporal.ZonedDateTime.from(
                `${event.date}T${event.end_time}[UTC]`
            ).withTimeZone(timezone);
            return {
                ...event,
                date: startZdt.toPlainDate().toString(),
                start_time: startZdt.toPlainTime().toString().slice(0, 8),
                end_time: endZdt.toPlainTime().toString().slice(0, 8),
                timezone
            };
        });
        const data = { week_start: schedule.week_start, events };
        await savePlan(data);
        nav('/dashboard');
    }

    // Discard the schedule and return to dashboard
    function leave() {
        sessionStorage.removeItem('generatedSchedule');
        nav('/dashboard');
    }

    if (blocks === null) return null;

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
