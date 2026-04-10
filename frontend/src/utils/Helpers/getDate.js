/**
 * Converts a task object's date and startTime into a Date object for comparison.
 * @param {Object} timeBlock - Task object with date and startTime fields
 * @returns {Date} Combined date and time as a Date object
 */
function buildDateTimeString(date, time) {
    return `${date}T${time}`;
}

function getDate(timeBlock) {
    return new Date(buildDateTimeString(timeBlock.date, timeBlock.startTime));
}

export default getDate;
