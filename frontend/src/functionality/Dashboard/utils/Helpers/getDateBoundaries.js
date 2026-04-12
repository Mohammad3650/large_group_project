/**
 * Returns the date boundaries used to group tasks by day section.
 *
 * @returns {{ today: Date, tomorrow: Date, dayAfterTomorrow: Date, weekEnd: Date }}
 */
function getDateBoundaries() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(today.getDate() + 2);
    const weekEnd = new Date(today);
    weekEnd.setDate(today.getDate() + 7);
    return { today, tomorrow, dayAfterTomorrow, weekEnd };
}

export default getDateBoundaries;
