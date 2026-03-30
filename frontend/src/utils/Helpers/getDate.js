/**
 * Converts a task object's date and startTime into a Date object for comparison.
 * @param {Object} timeBlock - Task object with date and startTime fields
 * @returns {Date} Combined date and time as a Date object
 */
const getDate = (timeBlock) => new Date(`${timeBlock.date}T${timeBlock.startTime}`);

export default getDate;
