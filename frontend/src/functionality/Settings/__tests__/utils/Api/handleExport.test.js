import { describe, it, expect, vi, beforeEach } from 'vitest';
import handleExport from '../../../utils/Api/handleExport.js';
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

describe('handleExport', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('downloads the file when the request succeeds', async () => {
        const setError = vi.fn();
        const mockBlob = new Blob(['file content'], { type: 'text/plain' });

        api.get.mockResolvedValue({ data: mockBlob });

        await handleExport('/api/export/', 'studysync_schedule.csv', setError);

        expect(api.get).toHaveBeenCalledWith('/api/export/', {
            responseType: 'blob'
        });
        expect(downloadFile).toHaveBeenCalledWith(
            mockBlob,
            'studysync_schedule.csv'
        );
        expect(setError).not.toHaveBeenCalled();
    });

    it('sets the fallback file error message when filename has no extension', async () => {
        const setError = vi.fn();
        api.get.mockRejectedValue(new Error('Export failed'));

        await handleExport('/api/export/', 'studysync_schedule', setError);

        expect(downloadFile).not.toHaveBeenCalled();
        expect(setError).toHaveBeenCalledWith('Failed to export file');
    });

    it('sets a CSV error message when csv export fails', async () => {
        const setError = vi.fn();
        api.get.mockRejectedValue(new Error('Export failed'));

        await handleExport('/api/export/', 'studysync_schedule.csv', setError);

        expect(downloadFile).not.toHaveBeenCalled();
        expect(setError).toHaveBeenCalledWith('Failed to export CSV');
    });

    it('sets an ICS error message when ics export fails', async () => {
        const setError = vi.fn();
        api.get.mockRejectedValue(new Error('Export failed'));

        await handleExport('/api/export/', 'studysync_schedule.ics', setError);

        expect(downloadFile).not.toHaveBeenCalled();
        expect(setError).toHaveBeenCalledWith('Failed to export ICS');
    });
});