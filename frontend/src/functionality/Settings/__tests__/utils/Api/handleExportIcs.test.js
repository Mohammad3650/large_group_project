import { describe, it, expect, vi, beforeEach } from 'vitest';
import handleExportIcs from '../../../utils/Api/handleExportIcs.js';
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

describe('handleExportIcs', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('downloads the ICS file when the request succeeds', async () => {
        const setError = vi.fn();
        const mockBlob = new Blob(['ics content'], { type: 'text/calendar' });

        api.get.mockResolvedValue({ data: mockBlob });

        await handleExportIcs(setError);

        expect(api.get).toHaveBeenCalledWith('/api/time-blocks/export/ics/', {
            responseType: 'blob'
        });

        expect(downloadFile).toHaveBeenCalledWith(
            mockBlob,
            'studysync_schedule.ics'
        );

        expect(setError).not.toHaveBeenCalled();
    });

    it('sets an error when the request fails', async () => {
        const setError = vi.fn();

        api.get.mockRejectedValue(new Error('Export failed'));

        await handleExportIcs(setError);

        expect(downloadFile).not.toHaveBeenCalled();
        expect(setError).toHaveBeenCalledWith('Failed to export ICS');
    });
});