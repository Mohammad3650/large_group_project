import exportFile from '../Helpers/exportFile.js';

const EXPORT_ICS_ENDPOINT = '/api/time-blocks/export/ics/';
const EXPORT_ICS_FILENAME = 'studysync_schedule.ics';
const EXPORT_ICS_ERROR = 'Failed to export ICS';

/**
 * Export the user's schedule as an ICS file.
 *
 * @param {Function} setError - Error state setter
 * @returns {Promise<void>} Resolves when export completes
 */
async function handleExportIcs(setError) {
    try {
        await exportFile(EXPORT_ICS_ENDPOINT, EXPORT_ICS_FILENAME);
    } catch {
        setError(EXPORT_ICS_ERROR);
    }
}

export default handleExportIcs;