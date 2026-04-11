import getDate from '../../../../utils/Helpers/getDate.js';
import getDateBoundaries from '../../../../utils/Helpers/getDateBoundaries.js';
import sortTasksByCompletedAt from '../../../../utils/Helpers/sortTasksByCompletedAt.js';
import sortTasksByPinnedAt from '../../../../utils/Helpers/sortTasksByPinnedAt.js';
import filterTasksByDatePredicate from '../../../../utils/Helpers/filterTasksByDatePredicate.js';
import sortTasksByDate from '../../../../utils/Helpers/sortTasksByDate.js';

/**
 * Groups an array of time blocks into date-based categories.
 * Pinned tasks are extracted first and excluded from all date groups.
 *
 * @param {Object[]} blocks - Array of time block objects to group
 * @returns {{
 *   pinnedTasks: Object[],
 *   overdueTasks: Object[],
 *   todayTasks: Object[],
 *   tomorrowTasks: Object[],
 *   weekTasks: Object[],
 *   beyondWeekTasks: Object[],
 *   completedTasks: Object[]
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