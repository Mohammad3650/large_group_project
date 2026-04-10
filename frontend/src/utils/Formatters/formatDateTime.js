/**
 * Formats date and time strings into a human-readable format.
 *
 * @param {string} date - Date string (e.g. "2026-02-19")
 * @param {string} startTime - Start time string (e.g. "09:00:00")
 * @param {string} endTime - End time string (e.g. "10:00:00")
 * @returns {string} Formatted string (e.g. "09:00 - 10:00 Thu 19 Feb")
 */
function buildDateTime(date, time) {
    return new Date(`${date}T${time}`);
}

function formatDayLabel(date) {
    return date.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
    });
}

function formatTimeLabel(date) {
    return date.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatDateTime(date, startTime, endTime) {
    const startDateTime = buildDateTime(date, startTime);
    const endDateTime = buildDateTime(date, endTime);

    const dayLabel = formatDayLabel(startDateTime);
    const startLabel = formatTimeLabel(startDateTime);
    const endLabel = formatTimeLabel(endDateTime);

    return `${startLabel} - ${endLabel} ${dayLabel}`;
}

export default formatDateTime;
