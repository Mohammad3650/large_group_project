import getDate from './getDate.js';

/**
 * Sorts tasks in ascending order by datetime.
 * @param {Object} firstTimeBlock - First task object
 * @param {Object} secondTimeBlock - Second task object
 * @returns {number} Negative if firstTimeBlock is earlier, positive if secondTimeBlock is earlier, zero if equal
 */
const sortTasksByDate = (firstTimeBlock, secondTimeBlock) => getDate(firstTimeBlock) - getDate(secondTimeBlock);

export default sortTasksByDate;
