import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import useAuthForm from '../../../utils/Hooks/useAuthForm.js';
import {
    formatApiError,
    createInitialErrors
} from '../../../utils/errors.js';

vi.mock('../../../utils/errors.js', () => ({
    formatApiError: vi.fn(),
    createInitialErrors: vi.fn(() => ({
        fieldErrors: {},
        global: []
    }))
}));

function createSubmitEvent() {
    return {
        preventDefault: vi.fn()
    };
}

describe('useAuthForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns the initial form state', () => {
        const validateForm = vi.fn(() => ({}));
        const submitForm = vi.fn();

        const { result } = renderHook(() =>
            useAuthForm(validateForm, submitForm)
        );

        expect(createInitialErrors).toHaveBeenCalled();
        expect(result.current.errors).toEqual({
            fieldErrors: {},
            global: []
        });
        expect(result.current.loading).toBe(false);
        expect(typeof result.current.handleSubmit).toBe('function');
        expect(typeof result.current.setErrors).toBe('function');
        expect(typeof result.current.clearErrors).toBe('function');
    });

    it('sets validation errors and does not submit when validation fails', async () => {
        const validateForm = vi.fn(() => ({
            email: 'Email is required.'
        }));
        const submitForm = vi.fn();
        const event = createSubmitEvent();

        const { result } = renderHook(() =>
            useAuthForm(validateForm, submitForm)
        );

        await act(async () => {
            await result.current.handleSubmit(event);
        });

        expect(event.preventDefault).toHaveBeenCalledTimes(1);
        expect(validateForm).toHaveBeenCalledTimes(1);
        expect(submitForm).not.toHaveBeenCalled();
        expect(result.current.errors).toEqual({
            fieldErrors: {
                email: 'Email is required.'
            },
            global: []
        });
        expect(result.current.loading).toBe(false);
    });

    it('submits successfully when validation passes', async () => {
        const validateForm = vi.fn(() => ({}));

        let resolveSubmit;
        const submitForm = vi.fn(
            () =>
                new Promise((resolve) => {
                    resolveSubmit = resolve;
                })
        );

        const event = createSubmitEvent();

        const { result } = renderHook(() =>
            useAuthForm(validateForm, submitForm)
        );

        act(() => {
            void result.current.handleSubmit(event);
        });

        await waitFor(() => {
            expect(result.current.loading).toBe(true);
        });

        expect(event.preventDefault).toHaveBeenCalledTimes(1);
        expect(validateForm).toHaveBeenCalledTimes(1);
        expect(submitForm).toHaveBeenCalledTimes(1);

        await act(async () => {
            resolveSubmit();
        });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.errors).toEqual({
            fieldErrors: {},
            global: []
        });
    });

    it('formats and stores API errors when submission fails', async () => {
        const validateForm = vi.fn(() => ({}));
        const submissionError = new Error('Request failed');
        const formattedError = {
            fieldErrors: {},
            global: ['Invalid email or password.']
        };

        const submitForm = vi.fn(() => Promise.reject(submissionError));
        formatApiError.mockReturnValue(formattedError);

        const event = createSubmitEvent();

        const { result } = renderHook(() =>
            useAuthForm(validateForm, submitForm)
        );

        await act(async () => {
            await result.current.handleSubmit(event);
        });

        expect(submitForm).toHaveBeenCalledTimes(1);
        expect(formatApiError).toHaveBeenCalledWith(submissionError);
        expect(result.current.errors).toEqual(formattedError);
        expect(result.current.loading).toBe(false);
    });

    it('returns early when submit is triggered while already loading', async () => {
        const validateForm = vi.fn(() => ({}));

        let resolveSubmit;
        const submitForm = vi.fn(
            () =>
                new Promise((resolve) => {
                    resolveSubmit = resolve;
                })
        );

        const eventOne = createSubmitEvent();
        const eventTwo = createSubmitEvent();

        const { result } = renderHook(() =>
            useAuthForm(validateForm, submitForm)
        );

        act(() => {
            void result.current.handleSubmit(eventOne);
        });

        await waitFor(() => {
            expect(result.current.loading).toBe(true);
        });

        act(() => {
            void result.current.handleSubmit(eventTwo);
        });

        expect(submitForm).toHaveBeenCalledTimes(1);

        await act(async () => {
            resolveSubmit();
        });
    });

    it('clears errors when clearErrors is called', () => {
        const validateForm = vi.fn(() => ({}));
        const submitForm = vi.fn();

        const { result } = renderHook(() =>
            useAuthForm(validateForm, submitForm)
        );

        act(() => {
            result.current.setErrors({
                fieldErrors: {
                    email: 'Email is required.'
                },
                global: ['Request failed.']
            });
        });

        expect(result.current.errors).toEqual({
            fieldErrors: {
                email: 'Email is required.'
            },
            global: ['Request failed.']
        });

        act(() => {
            result.current.clearErrors();
        });

        expect(result.current.errors).toEqual({
            fieldErrors: {},
            global: []
        });
    });
});