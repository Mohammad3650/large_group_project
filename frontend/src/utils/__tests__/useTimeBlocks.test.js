import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import useTimeBlocks from '../Hooks/useTimeBlocks.js';

vi.mock('../Api/getTimeBlocks.js', () => ({ default: vi.fn() }));
vi.mock('../Helpers/mapTimeBlocks.js', () => ({ default: vi.fn((blocks) => blocks) }));

import * as getTimeBlocksModule from '../Api/getTimeBlocks.js';
import * as mapTimeBlocksModule from '../Helpers/mapTimeBlocks.js';

const mockBlocks = [{ id: 1, name: 'Lecture' }, { id: 2, name: 'Seminar' }];

describe('Tests for useTimeBlocks', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('initialises with null blocks, loading true, and an empty error', () => {
        getTimeBlocksModule.default.mockImplementation(() => new Promise(() => {}));

        const { result } = renderHook(() => useTimeBlocks());

        expect(result.current.blocks).toBeNull();
        expect(result.current.loading).toBe(true);
        expect(result.current.error).toBe('');
    });

    it('fetches and maps time blocks on mount', async () => {
        getTimeBlocksModule.default.mockResolvedValue(mockBlocks);
        mapTimeBlocksModule.default.mockReturnValue(mockBlocks);

        const { result } = renderHook(() => useTimeBlocks());
        await waitFor(() => expect(result.current.blocks).not.toBeNull());

        expect(getTimeBlocksModule.default).toHaveBeenCalledTimes(1);
        expect(mapTimeBlocksModule.default).toHaveBeenCalledWith(mockBlocks);
        expect(result.current.blocks).toEqual(mockBlocks);
        expect(result.current.error).toBe('');
    });

    it('sets loading to false after a successful fetch', async () => {
        getTimeBlocksModule.default.mockResolvedValue(mockBlocks);
        const { result } = renderHook(() => useTimeBlocks());
        await waitFor(() => expect(result.current.loading).toBe(false));
    });

    it('sets blocks to the mapped output, not the raw API response', async () => {
        const rawData = [{ id: 1, raw: true }];
        const mappedData = [{ id: 1, mapped: true }];

        getTimeBlocksModule.default.mockResolvedValue(rawData);
        mapTimeBlocksModule.default.mockReturnValue(mappedData);

        const { result } = renderHook(() => useTimeBlocks());
        await waitFor(() => expect(result.current.blocks).toEqual(mappedData));
    });

    it('sets an error message and loading to false when the fetch fails', async () => {
        getTimeBlocksModule.default.mockRejectedValue(new Error('Network error'));

        const { result } = renderHook(() => useTimeBlocks());
        await waitFor(() => expect(result.current.error).toBe('Failed to load time blocks'));

        expect(result.current.blocks).toBeNull();
        expect(result.current.loading).toBe(false);
    });

    it('updates blocks when setBlocks is called', async () => {
        getTimeBlocksModule.default.mockResolvedValue(mockBlocks);

        const { result } = renderHook(() => useTimeBlocks());
        await waitFor(() => expect(result.current.blocks).not.toBeNull());

        const newBlocks = [{ id: 3, name: 'Workshop' }];
        act(() => result.current.setBlocks(newBlocks));

        expect(result.current.blocks).toEqual(newBlocks);
    });

    it('re-fetches blocks and updates state when refetchBlocks is called', async () => {
        getTimeBlocksModule.default.mockResolvedValue(mockBlocks);

        const { result } = renderHook(() => useTimeBlocks());
        await waitFor(() => expect(result.current.loading).toBe(false));

        const newBlocks = [{ id: 3, name: 'Workshop' }];
        getTimeBlocksModule.default.mockResolvedValue(newBlocks);
        mapTimeBlocksModule.default.mockReturnValue(newBlocks);

        await act(() => result.current.refetchBlocks());

        expect(result.current.blocks).toEqual(newBlocks);
        expect(getTimeBlocksModule.default).toHaveBeenCalledTimes(2);
    });

    it('exposes refetchBlocks as a function', async () => {
        getTimeBlocksModule.default.mockResolvedValue([]);

        const { result } = renderHook(() => useTimeBlocks());
        await waitFor(() => expect(result.current.loading).toBe(false));
        
        expect(typeof result.current.refetchBlocks).toBe('function');
    });
});