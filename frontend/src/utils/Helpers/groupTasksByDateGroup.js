import getDate from './getDate.js';
import getDateBoundaries from './getDateBoundaries.js';
import sortTasksByCompletedAt from './sortTasksByCompletedAt.js';
import sortTasksByPinnedAt from './sortTasksByPinnedAt.js';
import filterTasksByDatePredicate from './filterTasksByDatePredicate.js';
import sortTasksByDate from './sortTasksByDate.js';

/**
 * Groups an array of time blocks into date-based categories.
 * Pinned tasks are extracted first and excluded from all date groups.
 *
 * @param {Array} blocks - Array of time block objects to group
 * @returns {{
 *   pinnedTasks: Array,
 *   overdueTasks: Array,
 *   todayTasks: Array,
 *   tomorrowTasks: Array,
 *   weekTasks: Array,
 *   beyondWeekTasks: Array,
 *   completedTasks: Array
 * }} The grouped task arrays
 */
function groupTasksByDateGroup(blocks) {
    const { today, tomorrow, dayAfterTomorrow, weekEnd } = getDateBoundaries();

    const pinnedBlocks = blocks.filter((block) => block.pinned);
    const activeBlocks = blocks.filter((block) => !block.completed_at && !block.pinned);
    const completedBlocks = blocks.filter((block) => block.completed_at && !block.pinned);
    const tasksWithDates = activeBlocks.map((block) => ({ block, date: getDate(block) }));

    return {
        pinnedTasks: pinnedBlocks.slice().sort(sortTasksByPinnedAt),
        overdueTasks: filterTasksByDatePredicate(tasksWithDates, (date) => date < today).sort(sortTasksByDate),
        todayTasks: filterTasksByDatePredicate(tasksWithDates, (date) => date >= today && date < tomorrow).sort(sortTasksByDate),
        tomorrowTasks: filterTasksByDatePredicate(tasksWithDates, (date) => date >= tomorrow && date < dayAfterTomorrow).sort(sortTasksByDate),
        weekTasks: filterTasksByDatePredicate(tasksWithDates, (date) => date >= dayAfterTomorrow && date <= weekEnd).sort(sortTasksByDate),
        beyondWeekTasks: filterTasksByDatePredicate(tasksWithDates, (date) => date > weekEnd).sort(sortTasksByDate),
        completedTasks: completedBlocks.slice().sort(sortTasksByCompletedAt),
    };
}

export default groupTasksByDateGroup;