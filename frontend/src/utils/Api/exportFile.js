import { api } from '../../api.js';
import downloadFile from './downloadFile.js';

async function fetchFileBlob(endpoint) {
    const response = await api.get(endpoint, {
        responseType: 'blob'
    });

    return response.data;
}

async function exportFile(endpoint, filename) {
    const fileBlob = await fetchFileBlob(endpoint);
    downloadFile(fileBlob, filename);
}

export default exportFile;