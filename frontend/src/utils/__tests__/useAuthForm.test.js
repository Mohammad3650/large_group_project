import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import useAuthForm from '../Hooks/useAuthForm';
import * as errorsModule from '../Errors/errors';

describe('useAuthForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('initialises with empty errors and loading false', () => {
        const validate = vi.fn(() => ({}));
        const onSubmit = vi.fn();

        const { result } = renderHook(() => useAuthForm(validate, onSubmit));

        expect(result.current.errors).toEqual({
            fieldErrors: {},
            global: []
        });
        expect(result.current.loading).toBe(false);
    });

    it('shows validation errors and does not call onSubmit when validation fails', async () => {
        const validate = vi.fn(() => ({
            email: 'Email is required.'
        }));
        const onSubmit = vi.fn();

        const { result } = renderHook(() => useAuthForm(validate, onSubmit));

        await act(async () => {
            await result.current.handleSubmit({
                preventDefault: vi.fn()
            });
        });

        expect(validate).toHaveBeenCalled();
        expect(onSubmit).not.toHaveBeenCalled();
        expect(result.current.errors).toEqual({
            fieldErrors: { email: 'Email is required.' },
            global: []
        });
        expect(result.current.loading).toBe(false);
    });

    it('clears previous errors and calls onSubmit when validation passes', async () => {
        const validate = vi.fn(() => ({}));
        const onSubmit = vi.fn().mockResolvedValue();

        const { result } = renderHook(() => useAuthForm(validate, onSubmit));

        await act(async () => {
            result.current.setErrors({
                fieldErrors: { email: 'Old error' },
                global: ['Old global error']
            });
        });

        await act(async () => {
            await result.current.handleSubmit({
                preventDefault: vi.fn()
            });
        });

        expect(validate).toHaveBeenCalled();
        expect(onSubmit).toHaveBeenCalled();
        expect(result.current.errors).toEqual({
            fieldErrors: {},
            global: []
        });
    });

    it('sets loading true during submission and false afterwards', async () => {
        let resolveSubmit;

        const validate = vi.fn(() => ({}));
        const onSubmit = vi.fn(
            () =>
                new Promise((resolve) => {
                    resolveSubmit = resolve;
                })
        );

        const { result } = renderHook(() => useAuthForm(validate, onSubmit));

        act(() => {
            result.current.handleSubmit({
                preventDefault: vi.fn()
            });
        });

        expect(result.current.loading).toBe(true);

        await act(async () => {
            resolveSubmit();
        });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });
    });

    it('formats and stores API errors when onSubmit fails', async () => {
        const validate = vi.fn(() => ({}));
        const submitError = new Error('Request failed');
        const onSubmit = vi.fn().mockRejectedValue(submitError);

        vi.spyOn(errorsModule, 'formatApiError').mockReturnValue({
            fieldErrors: {},
            global: ['Something went wrong.']
        });

        const { result } = renderHook(() => useAuthForm(validate, onSubmit));

        await act(async () => {
            await result.current.handleSubmit({
                preventDefault: vi.fn()
            });
        });

        expect(errorsModule.formatApiError).toHaveBeenCalledWith(submitError);
        expect(result.current.errors).toEqual({
            fieldErrors: {},
            global: ['Something went wrong.']
        });
        expect(result.current.loading).toBe(false);
    });

    it('does not submit again while already loading', async () => {
        let resolveSubmit;

        const validate = vi.fn(() => ({}));
        const onSubmit = vi.fn(
            () =>
                new Promise((resolve) => {
                    resolveSubmit = resolve;
                })
        );

        const { result } = renderHook(() => useAuthForm(validate, onSubmit));

        act(() => {
            result.current.handleSubmit({
                preventDefault: vi.fn()
            });
        });

        act(() => {
            result.current.handleSubmit({
                preventDefault: vi.fn()
            });
        });

        expect(onSubmit).toHaveBeenCalledTimes(1);

        await act(async () => {
            resolveSubmit();
        });
    });

    it('always calls preventDefault on submit', async () => {
        const validate = vi.fn(() => ({}));
        const onSubmit = vi.fn().mockResolvedValue();
        const preventDefault = vi.fn();

        const { result } = renderHook(() => useAuthForm(validate, onSubmit));

        await act(async () => {
            await result.current.handleSubmit({ preventDefault });
        });

        expect(preventDefault).toHaveBeenCalled();
    });
});
