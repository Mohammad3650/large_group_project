import handleExport from './handleExport.js';

const EXPORT_CSV_ENDPOINT = '/api/time-blocks/export/csv/';
const EXPORT_CSV_FILENAME = 'studysync_schedule.csv';

/**
 * Export the user's schedule as a CSV file.
 *
 * @param {Function} setError
 * @returns {Promise<void>}
 */
async function handleExportCsv(setError) {
    return handleExport(EXPORT_CSV_ENDPOINT, EXPORT_CSV_FILENAME, setError);
}

export default handleExportCsv;