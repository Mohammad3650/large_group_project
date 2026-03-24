import getDate from "./getDate.js";

/**
 * Sorts tasks in ascending order by datetime.
 * @param {Object} a - First task object
 * @param {Object} b - Second task object
 * @returns {number} Negative if a comes first, positive if b comes first
 */
const sortTasksByDate = (a, b) => getDate(a) - getDate(b);

export default sortTasksByDate;