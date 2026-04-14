import mapTimeBlocks from '../Helpers/mapTimeBlocks.js';

/**
 * Fetches and processes the generated schedule from sessionStorage.
 * @returns {Object|null} An object with blocks and schedule, or null if no schedule found.
 */
function fetchGeneratedSchedule() {
    try {
        const stored = sessionStorage.getItem('generatedSchedule');
        const schedule = JSON.parse(stored);
        if (!schedule) return null;

        const events = schedule['events'];
        const scheduled = schedule['scheduled'];
        const combined = [...events, ...scheduled];
        const blocks = mapTimeBlocks(combined);

        return { blocks, schedule };
    } catch (err) {
        console.error('Failed to load time blocks', err);
        return null;
    }
}

export default fetchGeneratedSchedule;