import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import useNotesSection from '../../../utils/Hooks/useNotesSection.js';

vi.mock('../../../utils/Hooks/useNotes.js', () => ({ default: vi.fn() }));
vi.mock('../../../utils/Hooks/useAutoSave.js', () => ({ default: vi.fn() }));

import * as useNotesModule from '../../../utils/Hooks/useNotes.js';
import * as useAutoSaveModule from '../../../utils/Hooks/useAutoSave.js';

const mockSetNotes = vi.fn();

const defaultNotes = {
    notes: 'My notes',
    setNotes: mockSetNotes,
    loaded: true,
    loading: false,
    error: '',
};

describe('useNotesSection', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useNotesModule.default.mockReturnValue(defaultNotes);
        useAutoSaveModule.default.mockImplementation(() => {});
    });

    it('returns notes from useNotes', () => {
        const { result } = renderHook(() => useNotesSection());
        expect(result.current.notes).toBe('My notes');
    });

    it('returns setNotes from useNotes', () => {
        const { result } = renderHook(() => useNotesSection());
        expect(result.current.setNotes).toBe(mockSetNotes);
    });

    it('returns loading from useNotes', () => {
        useNotesModule.default.mockReturnValue({ ...defaultNotes, loading: true });
        const { result } = renderHook(() => useNotesSection());
        expect(result.current.loading).toBe(true);
    });

    it('returns error from useNotes', () => {
        useNotesModule.default.mockReturnValue({ ...defaultNotes, error: 'Failed to load' });
        const { result } = renderHook(() => useNotesSection());
        expect(result.current.error).toBe('Failed to load');
    });

    it('initialises saveStatus as an empty string', () => {
        const { result } = renderHook(() => useNotesSection());
        expect(result.current.saveStatus).toBe('');
    });

    it('calls useAutoSave with notes, loaded, and a setSaveStatus function', () => {
        renderHook(() => useNotesSection());
        expect(useAutoSaveModule.default).toHaveBeenCalledWith(
            defaultNotes.notes,
            defaultNotes.loaded,
            expect.any(Function)
        );
    });

    it('updates saveStatus when useAutoSave calls its setSaveStatus argument', () => {
        useAutoSaveModule.default.mockImplementation((_notes, _loaded, setSaveStatus) => {
            setSaveStatus('saving');
        });
        const { result } = renderHook(() => useNotesSection());
        expect(result.current.saveStatus).toBe('saving');
    });
});
