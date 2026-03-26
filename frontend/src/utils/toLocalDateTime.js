import 'temporal-polyfill/global';
import getUserTimezone from './getUserTimezone.js';

/**
 * Converts a UTC date and time into the user's local timezone.
 *
 * @param {string} date - Date string in UTC (e.g. "2026-03-22")
 * @param {string} time - Time string in UTC (e.g. "09:00:00")
 * @returns {{ zonedDateTime: Temporal.ZonedDateTime, localDate: string, localTime: string }}
 */
function toLocalDateTime(date, time) {
    const userTimezone = getUserTimezone();
    const zonedDateTime = Temporal.ZonedDateTime.from(
        `${date}T${time.slice(0, 5)}[UTC]`
    ).withTimeZone(userTimezone);

    const localDate = zonedDateTime.toPlainDate().toString();
    const localTime = `${String(zonedDateTime.hour).padStart(2, '0')}:${String(zonedDateTime.minute).padStart(2, '0')}`;

    return { zonedDateTime: zonedDateTime, localDate, localTime };
}

export default toLocalDateTime;
