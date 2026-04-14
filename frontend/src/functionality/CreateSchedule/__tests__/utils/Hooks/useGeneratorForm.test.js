import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import useGeneratorForm from '../../../utils/Hooks/useGeneratorForm.js';

vi.mock('../../../../../utils/Helpers/getUserTimezone.js', () => ({
    default: vi.fn(() => 'UTC'),
}));

describe('useGeneratorForm', () => {
    let mockOnSubmit;
    let mockClearErrors;

    beforeEach(() => {
        mockOnSubmit = vi.fn();
        mockClearErrors = vi.fn();
    });

    it('initializes with default state', () => {
        const { result } = renderHook(() =>
            useGeneratorForm(mockOnSubmit, false, {}, mockClearErrors)
        );

        expect(result.current.weekStart).toBe('');
        expect(result.current.weekEnd).toBe('');
        expect(result.current.evenSpread).toBe(false);
        expect(result.current.includeScheduled).toBe(false);
        expect(result.current.windows).toEqual({
            start_min: '',
            end_min: '',
            daily: true,
            timezone: 'UTC',
        });
        expect(result.current.blocks).toHaveLength(1);
        expect(result.current.blocks[0]).toEqual({
            name: '',
            duration: '',
            frequency: '',
            daily: false,
            start_time_preference: 'None',
            location: '',
            block_type: 'study',
            description: '',
            timezone: 'UTC',
        });
        expect(result.current.serverErrors).toEqual({});
    });

    it('calls clearErrors on mount', () => {
        renderHook(() =>
            useGeneratorForm(mockOnSubmit, false, {}, mockClearErrors)
        );

        expect(mockClearErrors).toHaveBeenCalledTimes(1);
    });

    it('addBlock adds a new block and calls clearErrors', () => {
        const { result } = renderHook(() =>
            useGeneratorForm(mockOnSubmit, false, {}, mockClearErrors)
        );

        act(() => {
            result.current.addBlock();
        });

        expect(result.current.blocks).toHaveLength(2);
        expect(mockClearErrors).toHaveBeenCalledTimes(2); // once on mount, once on add
    });

    it('updateBlock updates a field in a block', () => {
        const { result } = renderHook(() =>
            useGeneratorForm(mockOnSubmit, false, {}, mockClearErrors)
        );

        act(() => {
            result.current.updateBlock(0, 'name', 'Test Event');
        });

        expect(result.current.blocks[0].name).toBe('Test Event');
    });

    it('updateBlock sets frequency to 1 when daily is true', () => {
        const { result } = renderHook(() =>
            useGeneratorForm(mockOnSubmit, false, {}, mockClearErrors)
        );

        act(() => {
            result.current.updateBlock(0, 'daily', true);
        });

        expect(result.current.blocks[0].daily).toBe(true);
        expect(result.current.blocks[0].frequency).toBe('1');
    });

    it('updateBlock sets frequency to empty when daily is false', () => {
        const { result } = renderHook(() =>
            useGeneratorForm(mockOnSubmit, false, {}, mockClearErrors)
        );

        act(() => {
            result.current.updateBlock(0, 'daily', true);
        });
        expect(result.current.blocks[0].frequency).toBe('1');

        act(() => {
            result.current.updateBlock(0, 'daily', false);
        });

        expect(result.current.blocks[0].daily).toBe(false);
        expect(result.current.blocks[0].frequency).toBe('');
    });

    it('updateWindow updates a field in windows', () => {
        const { result } = renderHook(() =>
            useGeneratorForm(mockOnSubmit, false, {}, mockClearErrors)
        );

        act(() => {
            result.current.updateWindow('start_min', '08:00');
        });

        expect(result.current.windows.start_min).toBe('08:00');
    });

    it('deleteBlock removes a block and calls clearErrors', () => {
        const { result } = renderHook(() =>
            useGeneratorForm(mockOnSubmit, false, {}, mockClearErrors)
        );

        act(() => {
            result.current.addBlock();
        });
        expect(result.current.blocks).toHaveLength(2);

        act(() => {
            result.current.deleteBlock(0);
        });

        expect(result.current.blocks).toHaveLength(1);
        expect(mockClearErrors).toHaveBeenCalledTimes(3); // mount, add, delete
    });

    it('handleEvenSpreadChange sets evenSpread and resets includeScheduled when false', () => {
        const { result } = renderHook(() =>
            useGeneratorForm(mockOnSubmit, false, {}, mockClearErrors)
        );

        act(() => {
            result.current.setIncludeScheduled(true);
        });
        expect(result.current.includeScheduled).toBe(true);

        act(() => {
            result.current.handleEvenSpreadChange(false);
        });

        expect(result.current.evenSpread).toBe(false);
        expect(result.current.includeScheduled).toBe(false);
    });

    it('handleEvenSpreadChange sets evenSpread to true without affecting includeScheduled', () => {
        const { result } = renderHook(() =>
            useGeneratorForm(mockOnSubmit, false, {}, mockClearErrors)
        );

        act(() => {
            result.current.setIncludeScheduled(true);
        });

        act(() => {
            result.current.handleEvenSpreadChange(true);
        });

        expect(result.current.evenSpread).toBe(true);
        expect(result.current.includeScheduled).toBe(true);
    });

    it('handleSubmit prevents default and calls onSubmit with correct payload', () => {
        const { result } = renderHook(() =>
            useGeneratorForm(mockOnSubmit, false, {}, mockClearErrors)
        );

        const mockEvent = { preventDefault: vi.fn() };

        act(() => {
            result.current.setWeekStart('2026-03-23');
            result.current.setWeekEnd('2026-03-29');
            result.current.handleEvenSpreadChange(true);
            result.current.setIncludeScheduled(true);
            result.current.updateWindow('start_min', '08:00');
            result.current.updateWindow('end_min', '22:00');
            result.current.updateBlock(0, 'name', 'Test');
        });

        act(() => {
            result.current.handleSubmit(mockEvent);
        });

        expect(mockEvent.preventDefault).toHaveBeenCalled();
        expect(mockOnSubmit).toHaveBeenCalledWith({
            week_start: '2026-03-23',
            week_end: '2026-03-29',
            even_spread: true,
            include_scheduled: true,
            windows: [{
                start_min: '08:00',
                end_min: '22:00',
                daily: true,
                timezone: 'UTC',
            }],
            unscheduled: [{
                name: 'Test',
                duration: '',
                frequency: '',
                daily: false,
                start_time_preference: 'None',
                location: '',
                block_type: 'study',
                description: '',
                timezone: 'UTC',
            }],
        });
    });

    it('returns serverErrors as passed', () => {
        const serverErrors = { general: ['Error'] };
        const { result } = renderHook(() =>
            useGeneratorForm(mockOnSubmit, false, serverErrors, mockClearErrors)
        );

        expect(result.current.serverErrors).toEqual(serverErrors);
    });
});