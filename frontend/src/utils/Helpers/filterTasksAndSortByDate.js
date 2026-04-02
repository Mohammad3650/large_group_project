import sortTasksByDate from './sortTasksByDate.js';

/**
 * Filters and sorts an array of pre-computed block/date pairs by a date predicate.
 *
 * @param {Array<{block: Object, date: Date}>} blocksWithDates - Pre-computed block/date pairs
 * @param {Function} predicate - Function that takes a Date and returns a boolean
 * @returns {Array} Filtered and sorted array of block objects
 */
function filterTasksAndSortByDate(blocksWithDates, predicate) {
    return blocksWithDates
        .filter(({ date }) => predicate(date))
        .map(({ block }) => block)
        .sort(sortTasksByDate);
}

export default filterTasksAndSortByDate;
