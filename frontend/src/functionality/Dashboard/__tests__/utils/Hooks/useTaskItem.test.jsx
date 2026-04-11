import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useTaskItem from '../../../utils/Hooks/useTaskItem.js';

vi.mock('../../../utils/Audio/playDing.js', () => ({ default: vi.fn() }));

import * as playDingModule from '../../../utils/Audio/playDing.js';

const task = { id: 1, name: 'Test Task', date: '2026-04-10', startTime: '09:00', endTime: '10:00' };

describe('useTaskItem', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('returns id, name, date, startTime, endTime from the task object', () => {
        const { result } = renderHook(() => useTaskItem(task, vi.fn(), false));
        expect(result.current).toMatchObject({ id: 1, name: 'Test Task', date: '2026-04-10', startTime: '09:00', endTime: '10:00' });
    });

    it('initialises checked and fading as false', () => {
        const { result } = renderHook(() => useTaskItem(task, vi.fn(), false));
        expect(result.current.checked).toBe(false);
        expect(result.current.fading).toBe(false);
    });

    it('exposes handleClick as a function', () => {
        const { result } = renderHook(() => useTaskItem(task, vi.fn(), false));
        expect(typeof result.current.handleClick).toBe('function');
    });

    it('sets checked and fading to true on handleClick when task is not completed', () => {
        const { result } = renderHook(() => useTaskItem(task, vi.fn(), false));
        act(() => result.current.handleClick());
        expect(result.current.checked).toBe(true);
        expect(result.current.fading).toBe(true);
    });

    it('calls playDing on handleClick when task is not completed', () => {
        const { result } = renderHook(() => useTaskItem(task, vi.fn(), false));
        act(() => result.current.handleClick());
        expect(playDingModule.default).toHaveBeenCalledTimes(1);
    });

    it('calls onComplete after 500ms', () => {
        const onComplete = vi.fn();
        const { result } = renderHook(() => useTaskItem(task, onComplete, false));
        act(() => result.current.handleClick());
        expect(onComplete).not.toHaveBeenCalled();
        act(() => vi.advanceTimersByTime(500));
        expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it('ignores a second handleClick when already checked', () => {
        const onComplete = vi.fn();
        const { result } = renderHook(() => useTaskItem(task, onComplete, false));
        act(() => result.current.handleClick());
        act(() => vi.advanceTimersByTime(500));
        onComplete.mockClear();
        playDingModule.default.mockClear();
        act(() => result.current.handleClick());
        act(() => vi.advanceTimersByTime(500));
        expect(playDingModule.default).not.toHaveBeenCalled();
        expect(onComplete).not.toHaveBeenCalled();
    });

    it('does nothing when completed prop is true', () => {
        const onComplete = vi.fn();
        const { result } = renderHook(() => useTaskItem(task, onComplete, true));
        act(() => result.current.handleClick());
        act(() => vi.advanceTimersByTime(500));
        expect(playDingModule.default).not.toHaveBeenCalled();
        expect(onComplete).not.toHaveBeenCalled();
        expect(result.current.checked).toBe(false);
    });

    it('does not throw when onComplete is undefined', () => {
        const { result } = renderHook(() => useTaskItem(task, undefined, false));
        expect(() => {
            act(() => result.current.handleClick());
            act(() => vi.advanceTimersByTime(500));
        }).not.toThrow();
    });
});
