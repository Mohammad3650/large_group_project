import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTimeBlockForm } from '../Hooks/useTimeBlockForm.js';

vi.mock('../Helpers/getUserTimezone', () => ({
    default: vi.fn(() => 'UTC'),
}));

const EMPTY_BLOCK = {
    name: '',
    location: '',
    block_type: 'study',
    description: '',
    start_time: '',
    end_time: '',
};

function createInitialData(overrides = {}) {
    return {
        id: 1,
        date: '2026-04-10',
        name: 'Lecture',
        location: 'Room A',
        block_type: 'study',
        description: 'Attend lecture',
        start_time: '09:00',
        end_time: '10:00',
        ...overrides,
    };
}

function createMockEvent() {
    return { preventDefault: vi.fn() };
}

function expectSubmitData(mockFn, expectedData) {
    expect(mockFn).toHaveBeenCalledWith([expectedData]);
}

describe('useTimeBlockForm', () => {
    let mockOnSubmit;
    let mockClearErrors;

    function renderTimeBlockForm(props = {}) {
        return renderHook(
            ({ initialData, onSubmit, clearErrors }) =>
                useTimeBlockForm({ initialData, onSubmit, clearErrors }),
            {
                initialProps: {
                    initialData: null,
                    onSubmit: mockOnSubmit,
                    clearErrors: mockClearErrors,
                    ...props,
                },
            }
        );
    }

    beforeEach(() => {
        mockOnSubmit = vi.fn();
        mockClearErrors = vi.fn();
    });

    it('initialises with default state when no initialData is provided', () => {
        const { result } = renderTimeBlockForm();

        expect(result.current.date).toBe('');
        expect(result.current.blocks).toHaveLength(1);
        expect(result.current.blocks[0]).toEqual(EMPTY_BLOCK);
    });

    it('initialises with initialData when provided', () => {
        const initialData = createInitialData();

        const { result } = renderTimeBlockForm({ initialData });

        expect(result.current.date).toBe('2026-04-10');
        expect(result.current.blocks).toHaveLength(1);
        expect(result.current.blocks[0]).toEqual({
            id: 1,
            name: 'Lecture',
            location: 'Room A',
            block_type: 'study',
            description: 'Attend lecture',
            start_time: '09:00',
            end_time: '10:00',
        });
    });

    it('updates state when initialData changes', () => {
        const firstData = createInitialData();
        const updatedData = createInitialData({
            id: 2,
            date: '2026-04-12',
            name: 'Gym',
            location: 'Sports Centre',
            block_type: 'exercise',
            description: 'Workout session',
            start_time: '18:00',
            end_time: '19:00',
        });

        const { result, rerender } = renderTimeBlockForm({ initialData: firstData });

        expect(result.current.date).toBe('2026-04-10');
        expect(result.current.blocks[0].name).toBe('Lecture');

        rerender({
            initialData: updatedData,
            onSubmit: mockOnSubmit,
            clearErrors: mockClearErrors,
        });

        expect(result.current.date).toBe('2026-04-12');
        expect(result.current.blocks[0]).toEqual({
            id: 2,
            name: 'Gym',
            location: 'Sports Centre',
            block_type: 'exercise',
            description: 'Workout session',
            start_time: '18:00',
            end_time: '19:00',
        });
    });

    it('does not reset state when initialData becomes null on rerender', () => {
        const initialData = createInitialData();

        const { result, rerender } = renderTimeBlockForm({ initialData });

        act(() => {
            result.current.setDate('2026-04-20');
            result.current.updateBlock(0, 'name', 'Changed Title');
        });

        rerender({
            initialData: null,
            onSubmit: mockOnSubmit,
            clearErrors: mockClearErrors,
        });

        expect(result.current.date).toBe('2026-04-20');
        expect(result.current.blocks[0].name).toBe('Changed Title');
    });

    it('sets empty string for missing start_time and end_time in initialData', () => {
        const initialData = createInitialData({
            start_time: undefined,
            end_time: undefined,
        });

        const { result } = renderTimeBlockForm({ initialData });

        expect(result.current.blocks[0].start_time).toBe('');
        expect(result.current.blocks[0].end_time).toBe('');
    });

    it('sets empty string only for the missing time field in initialData', () => {
        const initialData = createInitialData({
            start_time: '09:00',
            end_time: undefined,
        });

        const { result } = renderTimeBlockForm({ initialData });

        expect(result.current.blocks[0].start_time).toBe('09:00');
        expect(result.current.blocks[0].end_time).toBe('');
    });

    it('addBlock adds a new empty block and calls clearErrors', () => {
        const { result } = renderTimeBlockForm();

        act(() => {
            result.current.addBlock();
        });

        expect(result.current.blocks).toHaveLength(2);
        expect(result.current.blocks[1]).toEqual(EMPTY_BLOCK);
        expect(mockClearErrors).toHaveBeenCalledTimes(1);
    });

    it('updateBlock updates a specific field and calls clearErrors', () => {
        const { result } = renderTimeBlockForm();

        act(() => {
            result.current.updateBlock(0, 'name', 'Deep Work');
        });

        expect(result.current.blocks[0].name).toBe('Deep Work');
        expect(mockClearErrors).toHaveBeenCalledTimes(1);
    });

    it('deleteBlock removes the block at the given index and calls clearErrors', () => {
        const { result } = renderTimeBlockForm();

        act(() => {
            result.current.addBlock();
        });

        expect(result.current.blocks).toHaveLength(2);

        act(() => {
            result.current.deleteBlock(0);
        });

        expect(result.current.blocks).toHaveLength(1);
        expect(mockClearErrors).toHaveBeenCalledTimes(2);
    });

    it('handleSubmit prevents default and calls onSubmit with formatted data', () => {
        const { result } = renderTimeBlockForm();
        const mockEvent = createMockEvent();

        act(() => {
            result.current.setDate('2026-04-15');
            result.current.updateBlock(0, 'name', 'Revision');
            result.current.updateBlock(0, 'location', 'Library');
            result.current.updateBlock(0, 'description', 'Study for exam');
            result.current.updateBlock(0, 'block_type', 'study');
            result.current.updateBlock(0, 'start_time', '14:00');
            result.current.updateBlock(0, 'end_time', '16:00');
        });

        act(() => {
            result.current.handleSubmit(mockEvent);
        });

        expect(mockEvent.preventDefault).toHaveBeenCalled();

        expectSubmitData(mockOnSubmit, {
            id: undefined,
            date: '2026-04-15',
            name: 'Revision',
            location: 'Library',
            description: 'Study for exam',
            block_type: 'study',
            start_time: '14:00',
            end_time: '16:00',
            timezone: 'UTC',
        });
    });

    it('handleSubmit includes existing id when submitting edited data', () => {
        const initialData = createInitialData();
        const { result } = renderTimeBlockForm({ initialData });
        const mockEvent = createMockEvent();

        act(() => {
            result.current.handleSubmit(mockEvent);
        });

        expectSubmitData(mockOnSubmit, {
            id: 1,
            date: '2026-04-10',
            name: 'Lecture',
            location: 'Room A',
            description: 'Attend lecture',
            block_type: 'study',
            start_time: '09:00',
            end_time: '10:00',
            timezone: 'UTC',
        });
    });

    it('returns all expected values and functions', () => {
        const { result } = renderTimeBlockForm();

        expect(result.current).toHaveProperty('date');
        expect(result.current).toHaveProperty('setDate');
        expect(result.current).toHaveProperty('blocks');
        expect(result.current).toHaveProperty('addBlock');
        expect(result.current).toHaveProperty('updateBlock');
        expect(result.current).toHaveProperty('deleteBlock');
        expect(result.current).toHaveProperty('handleSubmit');
    });

    it('sets date to an empty string when initialData has no date on rerender', () => {
        const firstData = createInitialData();
        const updatedData = createInitialData({
            date: undefined,
        });

        const { result, rerender } = renderTimeBlockForm({ initialData: firstData });

        expect(result.current.date).toBe('2026-04-10');

        rerender({
            initialData: updatedData,
            onSubmit: mockOnSubmit,
            clearErrors: mockClearErrors,
        });

        expect(result.current.date).toBe('');
        expect(result.current.blocks[0]).toEqual({
            id: 1,
            name: 'Lecture',
            location: 'Room A',
            block_type: 'study',
            description: 'Attend lecture',
            start_time: '09:00',
            end_time: '10:00',
        });
    });
});