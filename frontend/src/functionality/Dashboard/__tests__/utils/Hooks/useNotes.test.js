import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import useNotes from '../../../utils/Hooks/useNotes.js';

vi.mock('../Api/getNotes.js', () => ({ default: vi.fn() }));

import * as getNotesModule from '../../../utils/Api/getNotes.js';

describe('useNotes', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('initialises with an empty notes string, loaded false, loading true, and no error', () => {
        getNotesModule.default.mockImplementation(() => new Promise(() => {}));
        const { result } = renderHook(() => useNotes());
        expect(result.current.notes).toBe('');
        expect(result.current.loaded).toBe(false);
        expect(result.current.loading).toBe(true);
        expect(result.current.error).toBe('');
    });

    it('sets notes and loaded to true after a successful fetch', async () => {
        getNotesModule.default.mockResolvedValue('My notes');
        const { result } = renderHook(() => useNotes());
        await waitFor(() => expect(result.current.loaded).toBe(true));
        expect(result.current.notes).toBe('My notes');
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe('');
    });

    it('sets an error message and stops loading when the fetch fails', async () => {
        getNotesModule.default.mockRejectedValue(new Error('Network error'));
        const { result } = renderHook(() => useNotes());
        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.error).toBe('Failed to load notes. Please try again.');
        expect(result.current.loaded).toBe(false);
        expect(result.current.notes).toBe('');
    });

    it('sets loading to false after a successful fetch', async () => {
        getNotesModule.default.mockResolvedValue('content');
        const { result } = renderHook(() => useNotes());
        await waitFor(() => expect(result.current.loading).toBe(false));
    });

    it('exposes setNotes to allow notes to be updated', async () => {
        getNotesModule.default.mockResolvedValue('original');
        const { result } = renderHook(() => useNotes());
        await waitFor(() => expect(result.current.loaded).toBe(true));
        act(() => result.current.setNotes('updated'));
        await waitFor(() => expect(result.current.notes).toBe('updated'));
    });
});
