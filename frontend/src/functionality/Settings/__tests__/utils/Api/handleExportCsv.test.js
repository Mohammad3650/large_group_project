import { describe, it, expect, vi, beforeEach } from 'vitest';
import handleExportCsv from '../../../utils/Api/handleExportCsv.js';
import { api } from '../../../../../api.js';
import downloadFile from '../../../utils/Helpers/downloadFile.js';

vi.mock('../../../../../api.js', () => ({
    api: {
        get: vi.fn()
    }
}));

vi.mock('../../../utils/Helpers/downloadFile.js', () => ({
    default: vi.fn()
}));

describe('handleExportCsv', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('downloads the CSV file when the request succeeds', async () => {
        const setError = vi.fn();
        const mockBlob = new Blob(['csv content'], { type: 'text/csv' });

        api.get.mockResolvedValue({ data: mockBlob });

        await handleExportCsv(setError);

        expect(api.get).toHaveBeenCalledWith('/api/time-blocks/export/csv/', {
            responseType: 'blob'
        });

        expect(downloadFile).toHaveBeenCalledWith(
            mockBlob,
            'studysync_schedule.csv'
        );

        expect(setError).not.toHaveBeenCalled();
    });

    it('sets an error when the request fails', async () => {
        const setError = vi.fn();

        api.get.mockRejectedValue(new Error('Export failed'));

        await handleExportCsv(setError);

        expect(downloadFile).not.toHaveBeenCalled();
        expect(setError).toHaveBeenCalledWith('Failed to export CSV');
    });
});