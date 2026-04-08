/**
 * Sorts tasks in descending order by pin time, most recently pinned first.
 *
 * @param {Object} firstTimeBlock - First task object with a pinned_at timestamp
 * @param {Object} secondTimeBlock - Second task object with a pinned_at timestamp
 * @returns {number} Negative if firstTimeBlock was pinned more recently, positive if secondTimeBlock was pinned more recently, zero if equal
 */
const sortTasksByPinnedAt = (firstTimeBlock, secondTimeBlock) =>
    new Date(secondTimeBlock.pinned_at) - new Date(firstTimeBlock.pinned_at);

export default sortTasksByPinnedAt;