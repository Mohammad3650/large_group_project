import exportFile from '../Helpers/exportFile.js';

const EXPORT_CSV_ENDPOINT = '/api/time-blocks/export/csv/';
const EXPORT_CSV_FILENAME = 'studysync_schedule.csv';
const EXPORT_CSV_ERROR = 'Failed to export CSV';

/**
 * Export the user's schedule as a CSV file.
 *
 * @param {Function} setError - Error state setter
 * @returns {Promise<void>} Resolves when export completes
 */
async function handleExportCsv(setError) {
    try {
        await exportFile(EXPORT_CSV_ENDPOINT, EXPORT_CSV_FILENAME);
    } catch {
        setError(EXPORT_CSV_ERROR);
    }
}

export default handleExportCsv;