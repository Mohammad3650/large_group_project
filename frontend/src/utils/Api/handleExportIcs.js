import { api } from '../../api.js';
import downloadFile from '../Helpers/downloadFile.js';

const EXPORT_ICS_ENDPOINT = '/api/time-blocks/export/ics/';
const EXPORT_ICS_FILENAME = 'studysync_schedule.ics';

/**
 * Export the user's schedule as an ICS file.
 *
 * @param {Function} setError - Error state setter
 * @returns {Promise<void>} Resolves when export completes
 */
async function handleExportIcs(setError) {
    try {
        const response = await api.get(EXPORT_ICS_ENDPOINT, {
            responseType: 'blob'
        });

        downloadFile(response.data, EXPORT_ICS_FILENAME);
    } catch {
        setError('Failed to export ICS');
    }
}

export default handleExportIcs;
