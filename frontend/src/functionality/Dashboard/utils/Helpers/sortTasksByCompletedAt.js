/**
 * Sorts tasks in descending order by completion time, most recently completed first.
 * @param {Object} firstTimeBlock - First task object with a completed_at timestamp
 * @param {Object} secondTimeBlock - Second task object with a completed_at timestamp
 * @returns {number} Negative if firstTimeBlock was completed more recently, positive if secondTimeBlock was more recently completed, zero if equal
 */
const sortTasksByCompletedAt = (firstTimeBlock, secondTimeBlock) => new Date(secondTimeBlock.completed_at) - new Date(firstTimeBlock.completed_at);

export default sortTasksByCompletedAt;
