import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useGenerateSchedule } from '../../../utils/Hooks/useGenerateSchedule.js';
import generateSchedule from '../../../../../utils/Api/generateSchedule.js';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate
    };
});

vi.mock('../../../../../utils/Api/generateSchedule.js', () => ({
    default: vi.fn()
}));

function makeGenerateData(overrides = {}) {
    return {
        week_start: '2026-04-10',
        week_end: '2026-04-16',
        even_spread: true,
        include_scheduled: false,
        windows: [{ start_min: '08:00', end_min: '22:00', daily: true }],
        unscheduled: [],
        ...overrides
    };
}

function renderGenerateHook() {
    return renderHook(() => useGenerateSchedule());
}

async function submitGenerate(result, data = makeGenerateData()) {
    await act(async () => {
        await result.current.handleGenerate(data);
    });
}

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

        const { result } = renderGenerateHook();

        await submitGenerate(result);

        expect(generateSchedule).toHaveBeenCalledWith(makeGenerateData());

        expect(
            JSON.parse(sessionStorage.getItem('generatedSchedule'))
        ).toEqual({
            events: [{ id: 1, title: 'Generated Event' }]
        });

        expect(result.current.serverErrors).toEqual({});
        expect(result.current.loading).toBe(false);
        expect(mockNavigate).toHaveBeenCalledWith('/preview-calendar');
    });

    it('sets a general error when the API returns an empty events array', async () => {
        generateSchedule.mockResolvedValue({
            data: { events: [] }
        });

        const { result } = renderGenerateHook();

        await submitGenerate(result);

        expect(result.current.serverErrors).toEqual({
            general: ['No feasible schedule could be generated with the given constraints.']
        });

        expect(sessionStorage.getItem('generatedSchedule')).toBeNull();
        expect(result.current.loading).toBe(false);
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('sets server errors from response when generation fails', async () => {
        generateSchedule.mockRejectedValue({
            response: {
                data: { general: ['Generation failed.'] }
            }
        });

        const { result } = renderGenerateHook();

        await submitGenerate(result);

        expect(result.current.serverErrors).toEqual({
            general: ['Generation failed.']
        });

        expect(sessionStorage.getItem('generatedSchedule')).toBeNull();
        expect(result.current.loading).toBe(false);
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('clears previous errors before a successful submission', async () => {
        generateSchedule
            .mockRejectedValueOnce({
                response: {
                    data: { general: ['Generation failed.'] }
                }
            })
            .mockResolvedValueOnce({
                data: {
                    events: [{ id: 1, title: 'Generated Event' }]
                }
            });

        const { result } = renderGenerateHook();

        await submitGenerate(result);
        expect(result.current.serverErrors).toEqual({
            general: ['Generation failed.']
        });

        await submitGenerate(result);

        expect(result.current.serverErrors).toEqual({});
        expect(mockNavigate).toHaveBeenCalledWith('/preview-calendar');
    });

    it('does not submit if already loading', async () => {
        let resolveRequest;
        generateSchedule.mockImplementation(
            () => new Promise((resolve) => { resolveRequest = resolve; })
        );

        const { result } = renderGenerateHook();
        const data = makeGenerateData();

        act(() => {
            result.current.handleGenerate(data);
        });

        await submitGenerate(result, data);

        expect(generateSchedule).toHaveBeenCalledTimes(1);

        await act(async () => {
            resolveRequest({ data: { events: [{ id: 1 }] } });
        });

        expect(result.current.loading).toBe(false);
    });
});