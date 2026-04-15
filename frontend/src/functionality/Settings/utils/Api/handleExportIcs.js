import handleExport from './handleExport.js';

const EXPORT_ICS_ENDPOINT = '/api/time-blocks/export/ics/';
const EXPORT_ICS_FILENAME = 'studysync_schedule.ics';

/**
 * Export the user's schedule as an ICS file.
 *
 * @param {Function} setError
 * @returns {Promise<void>}
 */
async function handleExportIcs(setError) {
    return handleExport(EXPORT_ICS_ENDPOINT, EXPORT_ICS_FILENAME, setError);
}

export default handleExportIcs;