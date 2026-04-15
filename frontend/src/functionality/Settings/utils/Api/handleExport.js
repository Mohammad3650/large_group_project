import { api } from '../../../../api.js';
import downloadFile from '../Helpers/downloadFile.js';

function buildExportErrorMessage(filename) {
    const extension = filename.split('.').pop()?.toUpperCase() || 'file';
    return `Failed to export ${extension}`;
}

/**
 * Export a file from the backend and trigger a browser download.
 *
 * @param {string} endpoint
 * @param {string} filename
 * @param {Function} setError
 * @returns {Promise<void>}
 */
async function handleExport(endpoint, filename, setError) {
    try {
        const response = await api.get(endpoint, {
            responseType: 'blob'
        });

        downloadFile(response.data, filename);
    } catch {
        setError(buildExportErrorMessage(filename));
    }
}

export default handleExport;