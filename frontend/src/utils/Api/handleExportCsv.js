import { api } from '../../api.js';
import downloadFile from '../Helpers/downloadFile.js';



const EXPORT_CSV_ENDPOINT = '/api/time-blocks/export/csv/';
const EXPORT_CSV_FILENAME = 'studysync_schedule.csv';

/**
 * Export the user's schedule as a CSV file.
 *
 * @param {Function} setError - Error state setter
 * @returns {Promise<void>} Resolves when export completes
 */
async function handleExportCsv(setError) {
    try {
        const response = await api.get(EXPORT_CSV_ENDPOINT, {
            responseType: 'blob'
        });

        downloadFile(response.data, EXPORT_CSV_FILENAME);
    } catch (err) {
        setError('Failed to export CSV');
    }
}

export default handleExportCsv;
