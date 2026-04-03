/**
 * Filters an array of pre-computed block/date pairs by a date predicate.
 *
 * @param {Array<{block: Object, date: Date}>} blocksWithDates - Pre-computed block/date pairs
 * @param {Function} predicate - Function that takes a Date and returns a boolean
 * @returns {Array} Filtered array of block objects
 */
function filterTasksByDatePredicate(blocksWithDates, predicate) {
    return blocksWithDates
        .filter(({ date }) => predicate(date))
        .map(({ block }) => block);
}

export default filterTasksByDatePredicate;