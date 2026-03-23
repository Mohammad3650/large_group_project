/**
 * Formats date and time strings into a human-readable format.
 *
 * @param {string} date - Date string (e.g. "2026-02-19")
 * @param {string} startTime - Start time string (e.g. "09:00:00")
 * @param {string} endTime - End time string (e.g. "10:00:00")
 * @returns {string} Formatted string (e.g. "09:00 - 10:00 19 Feb")
 */
function formatDateTime(date, startTime, endTime) {
    const dateObj = new Date(`${date}T${startTime}`);
    const endObj = new Date(`${date}T${endTime}`);
    const day = dateObj.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    const start = dateObj.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    const end = endObj.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    return `${start} - ${end} ${day}`;
}

export default formatDateTime;