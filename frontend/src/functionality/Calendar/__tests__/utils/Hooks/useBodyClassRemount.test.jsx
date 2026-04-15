import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import useBodyClassRemount from '../../../utils/Hooks/useBodyClassRemount.js'

describe('useBodyClassRemount', () => {
    let mockObserve;
    let mockDisconnect;
    let capturedCallback;

    beforeEach(() => {
        mockObserve = vi.fn();
        mockDisconnect = vi.fn();

        vi.stubGlobal(
            'MutationObserver',
            vi.fn(function (callback) {
                capturedCallback = callback;
                return { observe: mockObserve, disconnect: mockDisconnect };
            })
        );
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('observes document.body for class attribute changes on mount', () => {
        const mockSetCalendarKey = vi.fn();

        renderHook(() => useBodyClassRemount(mockSetCalendarKey));

        expect(mockObserve).toHaveBeenCalledWith(document.body, {
            attributes: true,
            attributeFilter: ['class'],
        });
    });

    it('calls setCalendarKey with an incrementing updater when the body class changes', () => {
        const mockSetCalendarKey = vi.fn();

        renderHook(() => useBodyClassRemount(mockSetCalendarKey));
        capturedCallback();

        expect(mockSetCalendarKey).toHaveBeenCalledTimes(1);
        const updaterFunction = mockSetCalendarKey.mock.calls[0][0];
        expect(updaterFunction(3)).toBe(4);
    });

    it('disconnects the observer when the component unmounts', () => {
        const mockSetCalendarKey = vi.fn();

        const { unmount } = renderHook(() => useBodyClassRemount(mockSetCalendarKey));
        unmount();

        expect(mockDisconnect).toHaveBeenCalledTimes(1);
    });
});
