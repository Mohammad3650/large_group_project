import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useTaskGroup from '../../../utils/Hooks/useTaskGroup.js';

describe('useTaskGroup', () => {
    it('initialises isOpen as true', () => {
        const { result } = renderHook(() => useTaskGroup('today'));
        expect(result.current.isOpen).toBe(true);
    });

    it('exposes setIsOpen to toggle the open state', () => {
        const { result } = renderHook(() => useTaskGroup('today'));
        act(() => result.current.setIsOpen(false));
        expect(result.current.isOpen).toBe(false);
    });

    it.each([
        ['overdue',   true,  false],
        ['completed', false, true],
        ['today',     false, false],
        ['tomorrow',  false, false],
        ['week',      false, false],
        ['beyond',    false, false],
        ['pinned',    false, false],
    ])('variant "%s" → overdue=%s, completed=%s', (variant, expectedOverdue, expectedCompleted) => {
        const { result } = renderHook(() => useTaskGroup(variant));
        expect(result.current.overdue).toBe(expectedOverdue);
        expect(result.current.completed).toBe(expectedCompleted);
    });
});