/**
 * Sorts tasks in descending order by completion time, most recently completed first.
 * @param {Object} firstTimeBlock - First task object
 * @param {Object} secondTimeBlock - Second task object
 * @returns {number} Positive if firstTimeBlock was completed more recently, negative if secondTimeBlock was
 */
const sortTasksByCompletedAt = (firstTimeBlock, secondTimeBlock) => new Date(secondTimeBlock.completed_at) - new Date(firstTimeBlock.completed_at);

export default sortTasksByCompletedAt;
