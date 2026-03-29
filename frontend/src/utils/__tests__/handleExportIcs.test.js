import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import handleExportIcs from '../handleExportIcs.js';
import { api } from '../../api.js';

vi.mock('../../api.js', () => ({
    api: {
        get: vi.fn()
    }
}));

describe('Tests for handleExportIcs', () => {
    let createObjectURLSpy;
    let revokeObjectURLSpy;
    let createElementSpy;
    let appendChildSpy;
    let mockLink;

    beforeEach(() => {
        vi.clearAllMocks();

        createObjectURLSpy = vi
            .spyOn(window.URL, 'createObjectURL')
            .mockReturnValue('blob:mock-ics-url');

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

    it('downloads the ICS file when the API request succeeds', async () => {
        const setError = vi.fn();
        api.get.mockResolvedValue({
            data: 'ics-content'
        });

        await handleExportIcs(setError);

        expect(api.get).toHaveBeenCalledTimes(1);
        expect(api.get).toHaveBeenCalledWith('/api/time-blocks/export/ics/', {
            responseType: 'blob'
        });

        expect(document.createElement).toHaveBeenCalledWith('a');
        expect(window.URL.createObjectURL).toHaveBeenCalledTimes(1);
        expect(mockLink.setAttribute).toHaveBeenCalledWith(
            'download',
            'studysync_schedule.ics'
        );
        expect(document.body.appendChild).toHaveBeenCalledWith(mockLink);
        expect(mockLink.click).toHaveBeenCalledTimes(1);
        expect(mockLink.remove).toHaveBeenCalledTimes(1);
        expect(window.URL.revokeObjectURL).toHaveBeenCalledWith(
            'blob:mock-ics-url'
        );
        expect(setError).not.toHaveBeenCalled();
    });

    it('sets an error message when the ICS export fails', async () => {
        const setError = vi.fn();
        api.get.mockRejectedValue(new Error('Export failed'));

        await handleExportIcs(setError);

        expect(api.get).toHaveBeenCalledTimes(1);
        expect(setError).toHaveBeenCalledWith('Failed to export ICS');
        expect(mockLink.click).not.toHaveBeenCalled();
        expect(window.URL.revokeObjectURL).not.toHaveBeenCalled();
    });
});