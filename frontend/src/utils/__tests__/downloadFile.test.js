import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import downloadFile from '../Helpers/downloadFile.js';

describe('downloadFile', () => {
    let createObjectURLSpy;
    let revokeObjectURLSpy;

    beforeEach(() => {
        createObjectURLSpy = vi
            .spyOn(window.URL, 'createObjectURL')
            .mockReturnValue('blob:mock-url');

        revokeObjectURLSpy = vi
            .spyOn(window.URL, 'revokeObjectURL')
            .mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('creates a blob URL, clicks the link, and revokes the URL', () => {
        const realCreateElement = document.createElement.bind(document);

        const clickMock = vi.fn();
        const removeMock = vi.fn();

        const createElementSpy = vi
            .spyOn(document, 'createElement')
            .mockImplementation((tagName) => {
                const element = realCreateElement(tagName);

                if (tagName === 'a') {
                    element.click = clickMock;
                    element.remove = removeMock;
                }

                return element;
            });

        downloadFile('file-content', 'test-file.csv');

        expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
        expect(clickMock).toHaveBeenCalledTimes(1);
        expect(removeMock).toHaveBeenCalledTimes(1);
        expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url');

        createElementSpy.mockRestore();
    });
});