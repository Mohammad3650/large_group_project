import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import useDelayedRedirect from '../../../utils/Hooks/useDelayedRedirect.js';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');

    return {
        ...actual,
        useNavigate: () => mockNavigate
    };
});

describe('useDelayedRedirect', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('does not redirect when the trigger is falsy', () => {
        renderHook(() => useDelayedRedirect('', '/profile', 1200));

        act(() => {
            vi.advanceTimersByTime(1200);
        });

        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('redirects to the given path after the specified delay when the trigger is truthy', () => {
        renderHook(() => useDelayedRedirect('success', '/profile', 1200));

        act(() => {
            vi.advanceTimersByTime(1199);
        });

        expect(mockNavigate).not.toHaveBeenCalled();

        act(() => {
            vi.advanceTimersByTime(1);
        });

        expect(mockNavigate).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith('/profile');
    });

    it('clears the timeout when the hook unmounts before the delay completes', () => {
        const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');

        const { unmount } = renderHook(() =>
            useDelayedRedirect('success', '/profile', 1200)
        );

        unmount();

        act(() => {
            vi.advanceTimersByTime(1200);
        });

        expect(clearTimeoutSpy).toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled();

        clearTimeoutSpy.mockRestore();
    });

    it('restarts the redirect timer when the trigger changes', () => {
        const { rerender } = renderHook(
            ({ trigger }) => useDelayedRedirect(trigger, '/profile', 1200),
            {
                initialProps: { trigger: '' }
            }
        );

        act(() => {
            vi.advanceTimersByTime(1200);
        });

        expect(mockNavigate).not.toHaveBeenCalled();

        rerender({ trigger: 'success' });

        act(() => {
            vi.advanceTimersByTime(1199);
        });

        expect(mockNavigate).not.toHaveBeenCalled();

        act(() => {
            vi.advanceTimersByTime(1);
        });

        expect(mockNavigate).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith('/profile');
    });

    it('restarts the timeout when the path or delay changes', () => {
        const { rerender } = renderHook(
            ({ trigger, path, delay }) => useDelayedRedirect(trigger, path, delay),
            {
                initialProps: {
                    trigger: 'success',
                    path: '/profile',
                    delay: 1200
                }
            }
        );

        act(() => {
            vi.advanceTimersByTime(600);
        });

        rerender({
            trigger: 'success',
            path: '/dashboard',
            delay: 2000
        });

        act(() => {
            vi.advanceTimersByTime(1999);
        });

        expect(mockNavigate).not.toHaveBeenCalled();

        act(() => {
            vi.advanceTimersByTime(1);
        });

        expect(mockNavigate).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
});