import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import handleExportCsv from '../handleExportCsv.js';
import { api } from '../../api.js';

vi.mock('../../api.js', () => ({
    api: {
        get: vi.fn()
    }
}));

describe('handleExportCsv', () => {
    let createObjectURLSpy;
    let revokeObjectURLSpy;
    let createElementSpy;
    let appendChildSpy;
    let mockLink;

    beforeEach(() => {
        vi.clearAllMocks();

        createObjectURLSpy = vi
            .spyOn(window.URL, 'createObjectURL')
            .mockReturnValue('blob:mock-csv-url');

        revokeObjectURLSpy = vi
            .spyOn(window.URL, 'revokeObjectURL')
            .mockImplementation(() => {});

        mockLink = {
            href: '',
            click: vi.fn(),
            remove: vi.fn(),
            setAttribute: vi.fn()
        };

        createElementSpy = vi
            .spyOn(document, 'createElement')
            .mockReturnValue(mockLink);

        appendChildSpy = vi
            .spyOn(document.body, 'appendChild')
            .mockImplementation(() => {});
    });

    afterEach(() => {
        createObjectURLSpy.mockRestore();
        revokeObjectURLSpy.mockRestore();
        createElementSpy.mockRestore();
        appendChildSpy.mockRestore();
    });

    it('downloads the CSV file when the API request succeeds', async () => {
        const setError = vi.fn();
        api.get.mockResolvedValue({
            data: 'csv-content'
        });

        await handleExportCsv(setError);

        expect(api.get).toHaveBeenCalledTimes(1);
        expect(api.get).toHaveBeenCalledWith('/api/time-blocks/export/csv/', {
            responseType: 'blob'
        });

        expect(document.createElement).toHaveBeenCalledWith('a');
        expect(window.URL.createObjectURL).toHaveBeenCalledTimes(1);
        expect(mockLink.setAttribute).toHaveBeenCalledWith(
            'download',
            'studysync_schedule.csv'
        );
        expect(document.body.appendChild).toHaveBeenCalledWith(mockLink);
        expect(mockLink.click).toHaveBeenCalledTimes(1);
        expect(mockLink.remove).toHaveBeenCalledTimes(1);
        expect(window.URL.revokeObjectURL).toHaveBeenCalledWith(
            'blob:mock-csv-url'
        );
        expect(setError).not.toHaveBeenCalled();
    });

    it('sets an error message when the CSV export fails', async () => {
        const setError = vi.fn();
        api.get.mockRejectedValue(new Error('Export failed'));

        await handleExportCsv(setError);

        expect(api.get).toHaveBeenCalledTimes(1);
        expect(setError).toHaveBeenCalledWith('Failed to export CSV');
        expect(mockLink.click).not.toHaveBeenCalled();
        expect(window.URL.revokeObjectURL).not.toHaveBeenCalled();
    });
});