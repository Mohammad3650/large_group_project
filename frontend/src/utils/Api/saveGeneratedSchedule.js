import savePlan from './savePlan.js';
import getUserTimezone from '../Helpers/getUserTimezone.js';

/**
 * Saves the generated schedule to the backend and navigates to dashboard.
 * @param {Object} schedule - The schedule object with events and week_start.
 * @param {Function} nav - The navigation function.
 */
async function saveGeneratedSchedule(schedule, navigate) {
    const timezone = getUserTimezone();
    const events = schedule.events.map((event) => {
        const startZdt = Temporal.ZonedDateTime.from(`${event.date}T${event.start_time}[UTC]`).withTimeZone(timezone);
        const endZdt = Temporal.ZonedDateTime.from(`${event.date}T${event.end_time}[UTC]`).withTimeZone(timezone);
        return {
            ...event,
            date: startZdt.toPlainDate().toString(),
            start_time: startZdt.toPlainTime().toString().slice(0, 8),
            end_time: endZdt.toPlainTime().toString().slice(0, 8),
            timezone,
        };
    });
    const data = { week_start: schedule.week_start, events };
    await savePlan(data);
    navigate('/dashboard');
}

export default saveGeneratedSchedule;