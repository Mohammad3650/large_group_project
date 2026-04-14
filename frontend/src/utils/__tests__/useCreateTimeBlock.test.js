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

describe('Tests for useCreateTimeBlock', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('posts cleaned data and navigates to success page on success', async () => {
        api.post.mockResolvedValue({ data: { id: 123 } });

        const { result } = renderHook(() => useCreateTimeBlock());

        await act(async () => {
            await result.current.handleCreate([
                {
                    date: '2026-04-10',
                    name: 'Study Session',
                    location: 'Library',
                    description: 'Revision',
                    block_type: 'study',
                    start_time: '09:00',
                    end_time: '10:00'
                }
            ]);
        });

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

        const { result } = renderHook(() => useCreateTimeBlock());

        await act(async () => {
            await result.current.handleCreate([
                {
                    date: '2026-04-10',
                    name: 'Study Session',
                    location: '',
                    description: '',
                    block_type: 'study',
                    start_time: '',
                    end_time: ''
                }
            ]);
        });

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

        const { result } = renderHook(() => useCreateTimeBlock());

        await act(async () => {
            await result.current.handleCreate([
                {
                    date: '2026-04-10',
                    name: '',
                    location: '',
                    description: '',
                    block_type: 'study',
                    start_time: null,
                    end_time: null
                }
            ]);
        });

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

        const { result } = renderHook(() => useCreateTimeBlock());

        act(() => {
            result.current.handleCreate([
                {
                    date: '2026-04-10',
                    name: 'Study Session',
                    location: '',
                    description: '',
                    block_type: 'study',
                    start_time: null,
                    end_time: null
                }
            ]);
        });

        await act(async () => {
            await result.current.handleCreate([
                {
                    date: '2026-04-10',
                    name: 'Study Session',
                    location: '',
                    description: '',
                    block_type: 'study',
                    start_time: null,
                    end_time: null
                }
            ]);
        });

        expect(api.post).toHaveBeenCalledTimes(1);

        await act(async () => {
            resolveRequest({ data: { id: 1 } });
        });
    });
});