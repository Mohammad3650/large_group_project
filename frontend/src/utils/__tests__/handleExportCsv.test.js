import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '../../api.js';
import downloadFile from '../Helpers/downloadFile.js';
import handleExportCsv from '../Api/handleExportCsv.js';
import { api } from '../../api.js';
import downloadFile from '../Helpers/downloadFile.js';
import handleExportCsv from '../Api/handleExportCsv.js';

vi.mock('../../api.js', () => ({
    api: {
        get: vi.fn()
    }
}));

vi.mock('../Helpers/downloadFile.js', () => ({
    default: vi.fn()
}));

describe('handleExportCsv', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('requests the CSV export endpoint and downloads the file', async () => {
        const setError = vi.fn();
        api.get.mockResolvedValue({
            data: 'csv-content'
        });

        await handleExportCsv(setError);

        expect(api.get).toHaveBeenCalledWith('/api/time-blocks/export/csv/', {
            responseType: 'blob'
        });
        expect(downloadFile).toHaveBeenCalledWith(
            'csv-content',
            'studysync_schedule.csv'
        );
        expect(setError).not.toHaveBeenCalled();
    });

    it('sets an error when the export fails', async () => {
        const setError = vi.fn();
        api.get.mockRejectedValue(new Error('Export failed'));

        await handleExportCsv(setError);

        expect(downloadFile).not.toHaveBeenCalled();
        expect(setError).toHaveBeenCalledWith('Failed to export CSV');
    });
});