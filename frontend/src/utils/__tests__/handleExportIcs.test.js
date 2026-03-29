import { api } from '../../api.js';
import downloadFile from '../downloadFile.js';
import handleExportIcs from '../handleExportIcs.js';

vi.mock('../../api.js', () => ({
    api: {
        get: vi.fn()
    }
}));

vi.mock('../downloadFile.js', () => ({
    default: vi.fn()
}));

describe('handleExportIcs', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('requests the ICS export endpoint and downloads the file', async () => {
        const setError = vi.fn();
        api.get.mockResolvedValue({
            data: 'ics-content'
        });

        await handleExportIcs(setError);

        expect(api.get).toHaveBeenCalledWith('/api/time-blocks/export/ics/', {
            responseType: 'blob'
        });
        expect(downloadFile).toHaveBeenCalledWith(
            'ics-content',
            'studysync_schedule.ics'
        );
        expect(setError).not.toHaveBeenCalled();
    });

    it('sets an error when the export fails', async () => {
        const setError = vi.fn();
        api.get.mockRejectedValue(new Error('Export failed'));

        await handleExportIcs(setError);

        expect(downloadFile).not.toHaveBeenCalled();
        expect(setError).toHaveBeenCalledWith('Failed to export ICS');
    });
});