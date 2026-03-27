/**
 * Converts a task object's date and start_time into a Date object for comparison.
 * @param {Object} b - Task object with date and start_time fields
 * @returns {Date} Combined date and time as a Date object
 */
const getDate = (b) => new Date(`${b.date}T${b.startTime}`);

export default getDate;
