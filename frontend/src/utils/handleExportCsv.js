import { api } from '../api.js';

async function handleExportCsv(setError) {
    try {
        const response = await api.get('/api/time-blocks/export/csv/', {
            responseType: 'blob'
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'studysync_schedule.csv');
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    } catch (err) {
        setError('Failed to export CSV');
    }
}

export default handleExportCsv;
