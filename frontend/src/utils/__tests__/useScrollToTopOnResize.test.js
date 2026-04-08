import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import useScrollToTopOnResize from '../Hooks/useScrollToTopOnResize.js';

describe('useScrollToTopOnResize', () => {
    beforeEach(() => {
        vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
        vi.spyOn(window, 'addEventListener');
        vi.spyOn(window, 'removeEventListener');
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('adds a resize event listener on mount', () => {
        renderHook(() => useScrollToTopOnResize());
        expect(window.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
    });

    it('scrolls to the top when the window is resized', () => {
        renderHook(() => useScrollToTopOnResize());
        const handler = window.addEventListener.mock.calls.find(([event]) => event === 'resize')[1];
        handler();
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('removes the resize event listener on unmount', () => {
        const { unmount } = renderHook(() => useScrollToTopOnResize());
        unmount();
        expect(window.removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
    });
});
