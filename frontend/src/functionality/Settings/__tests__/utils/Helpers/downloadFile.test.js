import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import downloadFile from '../../../utils/Helpers/downloadFile.js';

describe('downloadFile', () => {
    let createObjectURLMock;
    let revokeObjectURLMock;
    let appendChildSpy;
    let removeChildSpy;
    let clickMock;
    let setAttributeMock;

    beforeEach(() => {
        createObjectURLMock = vi.fn(() => 'blob:mock-url');
        revokeObjectURLMock = vi.fn();
        clickMock = vi.fn();
        setAttributeMock = vi.fn();

        appendChildSpy = vi
            .spyOn(document.body, 'appendChild')
            .mockImplementation(() => {});
        removeChildSpy = vi
            .spyOn(document.body, 'removeChild')
            .mockImplementation(() => {});

        vi.stubGlobal('URL', {
            createObjectURL: createObjectURLMock,
            revokeObjectURL: revokeObjectURLMock
        });

        vi.spyOn(document, 'createElement').mockImplementation(() => ({
            href: '',
            setAttribute: setAttributeMock,
            click: clickMock,
            remove: vi.fn()
        }));
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it('creates a blob URL, triggers download, and revokes the URL', () => {
        downloadFile('file data', 'schedule.csv');

        expect(createObjectURLMock).toHaveBeenCalledTimes(1);
        expect(document.createElement).toHaveBeenCalledWith('a');
        expect(setAttributeMock).toHaveBeenCalledWith('download', 'schedule.csv');
        expect(appendChildSpy).toHaveBeenCalledTimes(1);
        expect(clickMock).toHaveBeenCalledTimes(1);
        expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:mock-url');
    });
});