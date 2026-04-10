import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useTaskGroup from '../../../utils/Hooks/useTaskGroup.js';

describe('useTaskGroup', () => {
    it('initialises isOpen as true', () => {
        const { result } = renderHook(() => useTaskGroup('today'));
        expect(result.current.isOpen).toBe(true);
    });

    it('exposes setIsOpen as a function', () => {
        const { result } = renderHook(() => useTaskGroup('today'));
        expect(typeof result.current.setIsOpen).toBe('function');
    });

    it('toggles isOpen when setIsOpen is called', () => {
        const { result } = renderHook(() => useTaskGroup('today'));
        act(() => result.current.setIsOpen(false));
        expect(result.current.isOpen).toBe(false);
    });

    it.each([
        ['overdue', true],
        ['today', false],
        ['completed', false],
        ['pinned', false],
    ])('overdue is %s when variant is "%s"', (variant, expected) => {
        const { result } = renderHook(() => useTaskGroup(variant));
        expect(result.current.overdue).toBe(expected);
    });

    it.each([
        ['completed', true],
        ['today', false],
        ['overdue', false],
        ['pinned', false],
    ])('completed is %s when variant is "%s"', (variant, expected) => {
        const { result } = renderHook(() => useTaskGroup(variant));
        expect(result.current.completed).toBe(expected);
    });
});