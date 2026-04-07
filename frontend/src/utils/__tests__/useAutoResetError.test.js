import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useAutoResetError from '../Hooks/useAutoResetError.js';

describe('useAutoResetError', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('does not call setError when error is an empty string', () => {
        const setError = vi.fn();
        renderHook(() => useAutoResetError('', setError));
        act(() => vi.advanceTimersByTime(10000));
        expect(setError).not.toHaveBeenCalled();
    });

    it('clears the error after the default delay of 5000ms', () => {
        const setError = vi.fn();
        renderHook(() => useAutoResetError('Something went wrong', setError));
        act(() => vi.advanceTimersByTime(4999));
        expect(setError).not.toHaveBeenCalled();
        act(() => vi.advanceTimersByTime(1));
        expect(setError).toHaveBeenCalledWith('');
    });

    it('clears the error after a custom delay', () => {
        const setError = vi.fn();
        renderHook(() => useAutoResetError('Something went wrong', setError, 3000));
        act(() => vi.advanceTimersByTime(2999));
        expect(setError).not.toHaveBeenCalled();
        act(() => vi.advanceTimersByTime(1));
        expect(setError).toHaveBeenCalledWith('');
    });

    it('resets the timer when the error changes', () => {
        const setError = vi.fn();
        const { rerender } = renderHook(
            ({ error }) => useAutoResetError(error, setError),
            { initialProps: { error: 'First error' } }
        );
        act(() => vi.advanceTimersByTime(3000));
        rerender({ error: 'Second error' });
        act(() => vi.advanceTimersByTime(3000));
        expect(setError).not.toHaveBeenCalled();
        act(() => vi.advanceTimersByTime(2000));
        expect(setError).toHaveBeenCalledTimes(1);
        expect(setError).toHaveBeenCalledWith('');
    });

    it('does not call setError after unmounting before the delay elapses', () => {
        const setError = vi.fn();
        const { unmount } = renderHook(() => useAutoResetError('Error', setError));
        unmount();
        act(() => vi.advanceTimersByTime(10000));
        expect(setError).not.toHaveBeenCalled();
    });
});
