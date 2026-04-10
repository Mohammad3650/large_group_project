import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useEffect } from 'react';

vi.mock('../stylesheets/NotesSection.css', () => ({}));
vi.mock('../../../utils/Hooks/useNotes.js');
vi.mock('../../../utils/Hooks/useAutoSave.js');

import NotesSection from '../../NotesSection/NotesSection.jsx';
import * as useNotesModule from '../../utils/Hooks/useNotes.js';
import * as useAutoSaveModule from '../../utils/Hooks/useAutoSave.js';

const defaultNotes = {
    notes: '',
    setNotes: vi.fn(),
    loaded: true,
    loading: false,
    error: '',
};

describe('Tests for NotesSection', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useNotesModule.default.mockReturnValue(defaultNotes);
        useAutoSaveModule.default.mockImplementation(() => {});
    });

    it('renders the loading indicator whilst notes are being fetched', () => {
        useNotesModule.default.mockReturnValue({ ...defaultNotes, loading: true });
        render(<NotesSection />);
        expect(screen.getByText('Loading notes...')).toBeInTheDocument();
    });

    it('renders the error message when fetching notes fails', () => {
        useNotesModule.default.mockReturnValue({ ...defaultNotes, loading: false, error: 'Failed to load notes. Please try again.' });
        render(<NotesSection />);
        expect(screen.getByText('Failed to load notes. Please try again.')).toBeInTheDocument();
    });

    it('renders the notes textarea after loading', () => {
        render(<NotesSection />);
        expect(screen.getByPlaceholderText('Notes')).toBeInTheDocument();
    });

    it('displays the saved notes in the textarea', () => {
        useNotesModule.default.mockReturnValue({ ...defaultNotes, notes: 'My notes' });
        render(<NotesSection />);
        expect(screen.getByDisplayValue('My notes')).toBeInTheDocument();
    });

    it('calls setNotes when the user types in the textarea', () => {
        const setNotes = vi.fn();
        useNotesModule.default.mockReturnValue({ ...defaultNotes, setNotes });
        render(<NotesSection />);
        fireEvent.change(screen.getByPlaceholderText('Notes'), { target: { value: 'New note' } });
        expect(setNotes).toHaveBeenCalledWith('New note');
    });

    it('renders a non-breaking space as the default save status', () => {
        render(<NotesSection />);
        expect(document.querySelector('.save-status').textContent).toBe('\u00A0');
    });

    it("shows 'Saving...' when the save status is saving", () => {
        useAutoSaveModule.default.mockImplementation((_notes, _loaded, setSaveStatus) => {
            useEffect(() => { setSaveStatus('saving'); }, []);
        });
        render(<NotesSection />);
        expect(screen.getByText('Saving...')).toBeInTheDocument();
    });

    it("shows 'Saved ✓' when the save status is saved", () => {
        useAutoSaveModule.default.mockImplementation((_notes, _loaded, setSaveStatus) => {
            useEffect(() => { setSaveStatus('saved'); }, []);
        });
        render(<NotesSection />);
        expect(screen.getByText('Saved ✓')).toBeInTheDocument();
    });

    it("shows 'Error saving ✗' when the save status is error", () => {
        useAutoSaveModule.default.mockImplementation((_notes, _loaded, setSaveStatus) => {
            useEffect(() => { setSaveStatus('error'); }, []);
        });
        render(<NotesSection />);
        expect(screen.getByText('Error saving ✗')).toBeInTheDocument();
    });

    it('applies the error class to the save status span when the save status is error', () => {
        useAutoSaveModule.default.mockImplementation((_notes, _loaded, setSaveStatus) => {
            useEffect(() => { setSaveStatus('error'); }, []);
        });
        render(<NotesSection />);
        expect(screen.getByText('Error saving ✗')).toHaveClass('error');
    });

    it('does not apply the error class to the save status span when the save status is not error', () => {
        render(<NotesSection />);
        expect(document.querySelector('.save-status')).not.toHaveClass('error');
    });
});