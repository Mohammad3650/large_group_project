import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCreateTimeBlock } from '../../utils/Hooks/useCreateTimeBlock.js';
import { api } from '../../api.js';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate
    };
});

vi.mock('../../api.js', () => ({
    api: {
        post: vi.fn()
    }
}));

function makeBlock(overrides = {}) {
    return {
        date: '2026-04-10',
        name: 'Study Session',
        location: '',
        description: '',
        block_type: 'study',
        start_time: null,
        end_time: null,
        ...overrides
    };
}

function renderCreateHook() {
    return renderHook(() => useCreateTimeBlock());
}

async function submitBlocks(result, blocks) {
    await act(async () => {
        await result.current.handleCreate(blocks);
    });
}

describe('Tests for useCreateTimeBlock', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('posts cleaned data and navigates to success page on success', async () => {
        api.post.mockResolvedValue({ data: { id: 123 } });

        const { result } = renderCreateHook();

        await submitBlocks(result, [
            makeBlock({
                location: 'Library',
                description: 'Revision',
                start_time: '09:00',
                end_time: '10:00'
            })
        ]);

        expect(api.post).toHaveBeenCalledWith('/api/time-blocks/', {
            date: '2026-04-10',
            name: 'Study Session',
            location: 'Library',
            description: 'Revision',
            block_type: 'study',
            start_time: '09:00',
            end_time: '10:00'
        });

        expect(mockNavigate).toHaveBeenCalledWith('/successful-time-block', {
            state: { id: 123 }
        });
    });

    it('cleans empty start_time and end_time strings to null before posting', async () => {
        api.post.mockResolvedValue({ data: { id: 1 } });

        const { result } = renderCreateHook();

        await submitBlocks(result, [
            makeBlock({
                start_time: '',
                end_time: ''
            })
        ]);

        expect(api.post).toHaveBeenCalledWith('/api/time-blocks/', {
            date: '2026-04-10',
            name: 'Study Session',
            location: '',
            description: '',
            block_type: 'study',
            start_time: null,
            end_time: null
        });
    });

    it('sets server errors and does not navigate when creation fails', async () => {
        api.post.mockRejectedValue({
            response: {
                data: { name: ['This field is required.'] }
            }
        });

        const { result } = renderCreateHook();

        await submitBlocks(result, [
            makeBlock({
                name: ''
            })
        ]);

        expect(mockNavigate).not.toHaveBeenCalled();
        expect(result.current.serverErrors).toEqual([
            { name: ['This field is required.'] }
        ]);
    });

    it('does not submit if already loading', async () => {
        let resolveRequest;
        api.post.mockImplementation(
            () => new Promise((resolve) => { resolveRequest = resolve; })
        );

        const { result } = renderCreateHook();
        const blocks = [makeBlock()];

        act(() => {
            result.current.handleCreate(blocks);
        });

        await submitBlocks(result, blocks);

        expect(api.post).toHaveBeenCalledTimes(1);

        await act(async () => {
            resolveRequest({ data: { id: 1 } });
        });
    });

    it('submits multiple blocks and navigates with the first created id when all succeed', async () => {
        api.post
            .mockResolvedValueOnce({ data: { id: 123 } })
            .mockResolvedValueOnce({ data: { id: 456 } });

        const { result } = renderCreateHook();

        await submitBlocks(result, [
            makeBlock({ name: 'Block 1' }),
            makeBlock({ name: 'Block 2' })
        ]);

        expect(api.post).toHaveBeenCalledTimes(2);
        expect(result.current.serverErrors).toEqual([{}, {}]);

        expect(mockNavigate).toHaveBeenCalledWith('/successful-time-block', {
            state: { id: 123 }
        });
    });

    it('does not navigate when at least one block fails in a multi-block submission', async () => {
        api.post
            .mockResolvedValueOnce({ data: { id: 123 } })
            .mockRejectedValueOnce({
                response: {
                    data: { end_time: ['End time is required.'] }
                }
            });

        const { result } = renderCreateHook();

        await submitBlocks(result, [
            makeBlock({ name: 'Block 1' }),
            makeBlock({ name: 'Block 2' })
        ]);

        expect(api.post).toHaveBeenCalledTimes(2);
        expect(mockNavigate).not.toHaveBeenCalled();
        expect(result.current.serverErrors).toEqual([
            {},
            { end_time: ['End time is required.'] }
        ]);
    });

    it('stores an empty error object when the request fails without response data', async () => {
        api.post.mockRejectedValue(new Error('Network Error'));

        const { result } = renderCreateHook();

        await submitBlocks(result, [makeBlock()]);

        expect(mockNavigate).not.toHaveBeenCalled();
        expect(result.current.serverErrors).toEqual([{}]);
    });
});