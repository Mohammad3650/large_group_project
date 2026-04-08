import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import useBodyClass from '../Hooks/useBodyClass.js';

describe('useBodyClass', () => {
    beforeEach(() => {
        document.body.className = '';
    });

    it('adds the class to the document body on mount', () => {
        renderHook(() => useBodyClass('test-class'));
        expect(document.body.classList.contains('test-class')).toBe(true);
    });

    it('removes the class from the document body on unmount', () => {
        const { unmount } = renderHook(() => useBodyClass('test-class'));
        unmount();
        expect(document.body.classList.contains('test-class')).toBe(false);
    });

    it('updates the body class when className changes', () => {
        const { rerender } = renderHook(({ cls }) => useBodyClass(cls), {
            initialProps: { cls: 'first-class' },
        });
        expect(document.body.classList.contains('first-class')).toBe(true);
        rerender({ cls: 'second-class' });
        expect(document.body.classList.contains('first-class')).toBe(false);
        expect(document.body.classList.contains('second-class')).toBe(true);
    });
});
