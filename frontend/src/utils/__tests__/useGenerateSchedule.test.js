import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useGenerateSchedule } from '../../utils/Hooks/useGenerateSchedule.js';
import generateSchedule from '../../utils/Api/generateSchedule.js';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate
    };
});

vi.mock('../../utils/Api/generateSchedule.js', () => ({
    default: vi.fn()
}));

const mockGenerateData = {
    week_start: '2026-04-10',
    week_end: '2026-04-16',
    even_spread: true,
    include_scheduled: false,
    windows: [{ start_min: '08:00', end_min: '22:00', daily: true }],
    unscheduled: []
};

describe('Tests for useGenerateSchedule', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        sessionStorage.clear();
    });

    it('stores the schedule in sessionStorage and navigates to preview on success', async () => {
        generateSchedule.mockResolvedValue({
            data: {
                events: [{ id: 1, title: 'Generated Event' }]
            }
        });

        const { result } = renderHook(() => useGenerateSchedule());

        await act(async () => {
            await result.current.handleGenerate(mockGenerateData);
        });

        expect(generateSchedule).toHaveBeenCalledWith(mockGenerateData);

        expect(
            JSON.parse(sessionStorage.getItem('generatedSchedule'))
        ).toEqual({
            events: [{ id: 1, title: 'Generated Event' }]
        });

        expect(mockNavigate).toHaveBeenCalledWith('/preview-calendar');
    });

    it('sets a general error when the API returns an empty events array', async () => {
        generateSchedule.mockResolvedValue({
            data: { events: [] }
        });

        const { result } = renderHook(() => useGenerateSchedule());

        await act(async () => {
            await result.current.handleGenerate(mockGenerateData);
        });

        expect(result.current.serverErrors).toEqual({
            general: ['No feasible schedule could be generated with the given constraints.']
        });

        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('sets server errors from response when generation fails', async () => {
        generateSchedule.mockRejectedValue({
            response: {
                data: { general: ['Generation failed.'] }
            }
        });

        const { result } = renderHook(() => useGenerateSchedule());

        await act(async () => {
            await result.current.handleGenerate(mockGenerateData);
        });

        expect(result.current.serverErrors).toEqual({
            general: ['Generation failed.']
        });

        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('does not submit if already loading', async () => {
        let resolveRequest;
        generateSchedule.mockImplementation(
            () => new Promise((resolve) => { resolveRequest = resolve; })
        );

        const { result } = renderHook(() => useGenerateSchedule());

        act(() => {
            result.current.handleGenerate(mockGenerateData);
        });

        await act(async () => {
            await result.current.handleGenerate(mockGenerateData);
        });

        expect(generateSchedule).toHaveBeenCalledTimes(1);

        await act(async () => {
            resolveRequest({ data: { events: [{ id: 1 }] } });
        });
    });
});