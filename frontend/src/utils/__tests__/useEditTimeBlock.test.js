import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import useEditTimeBlock from '../Hooks/useEditTimeBlock';
import { api } from '../../api';
import mapTimeBlockToFormData from '../Formatters/mapTimeBlockToFormData';
import buildUpdatePayload from '../Helpers/buildUpdatePayload';

vi.mock('../../api', () => ({
    api: {
        get: vi.fn(),
        patch: vi.fn()
    }
}));

vi.mock('../Formatters/mapTimeBlockToFormData', () => ({
    default: vi.fn()
}));

vi.mock('../Helpers/buildUpdatePayload', () => ({
    default: vi.fn()
}));

const mockApi = api;

describe('useEditTimeBlock', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('fetches and sets initial data on load', async () => {
        mockApi.get.mockResolvedValue({
            data: { id: 1, name: 'Raw Block' }
        });

        mapTimeBlockToFormData.mockReturnValue({
            id: 1,
            name: 'Mapped Block'
        });

        const { result } = renderHook(() => useEditTimeBlock('1'));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.initialData).toEqual({
            id: 1,
            name: 'Mapped Block'
        });
    });

    it('sets server error when fetch fails', async () => {
        mockApi.get.mockRejectedValue(new Error('Network error'));

        const { result } = renderHook(() => useEditTimeBlock('1'));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.serverErrors).toEqual([
            { detail: 'Unable to load this time block.' }
        ]);
    });

    it('successfully updates time block', async () => {
        buildUpdatePayload.mockReturnValue({ name: 'Updated' });
        mockApi.patch.mockResolvedValue({});

        const { result } = renderHook(() => useEditTimeBlock('1'));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        let success;

        await act(async () => {
            success = await result.current.update({ name: 'Updated' });
        });

        expect(mockApi.patch).toHaveBeenCalledWith(
            '/api/time-blocks/1/edit/',
            { name: 'Updated' }
        );

        expect(success).toBe(true);
    });

    it('handles update failure and stores server error', async () => {
        buildUpdatePayload.mockReturnValue({ name: 'Broken' });

        mockApi.patch.mockRejectedValue({
            response: {
                data: { detail: 'Server rejected update' }
            }
        });

        const { result } = renderHook(() => useEditTimeBlock('1'));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        let success;

        await act(async () => {
            success = await result.current.update({ name: 'Broken' });
        });

        expect(success).toBe(false);

        expect(result.current.serverErrors).toEqual([
            { detail: 'Server rejected update' }
        ]);
    });

    it('clears server errors correctly', async () => {
        const { result } = renderHook(() => useEditTimeBlock('1'));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        act(() => {
            result.current.clearErrors();
        });

        expect(result.current.serverErrors).toEqual([]);
    });

    it('handles update error when no server response is provided', async () => {
        buildUpdatePayload.mockReturnValue({ name: 'Broken' });

        mockApi.patch.mockRejectedValue(new Error('Network failure'));

        const { result } = renderHook(() => useEditTimeBlock('1'));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        let success;

        await act(async () => {
            success = await result.current.update({ name: 'Broken' });
        });

        expect(success).toBe(false);

        expect(result.current.serverErrors).toEqual([
            { detail: 'Failed to update time block.' }
        ]);
    });
});