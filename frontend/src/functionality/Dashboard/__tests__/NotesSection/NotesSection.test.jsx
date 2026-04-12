import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('../../utils/Hooks/useNotesSection.js', () => ({ default: vi.fn() }));
vi.mock('../../stylesheets/NotesSection/NotesSection.css', () => ({}));
vi.mock('../../../../components/ErrorMessage.jsx', () => ({
    default: ({ error }) => <p data-testid="error-message">{error}</p>,
}));

import NotesSection from '../../NotesSection/NotesSection.jsx';
import * as useNotesSectionModule from '../../utils/Hooks/useNotesSection.js';

const defaultState = {
    notes: '',
    setNotes: vi.fn(),
    loading: false,
    error: '',
    saveStatus: '',
};

describe('NotesSection component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useNotesSectionModule.default.mockReturnValue(defaultState);
    });

    it('renders the loading indicator while notes are loading', () => {
        useNotesSectionModule.default.mockReturnValue({ ...defaultState, loading: true });
        render(<NotesSection />);
        expect(screen.getByText('Loading notes...')).toBeInTheDocument();
    });

    it('renders the error message when loading fails', () => {
        useNotesSectionModule.default.mockReturnValue({
            ...defaultState,
            error: 'Failed to load notes. Please try again.',
        });
        render(<NotesSection />);
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
        expect(screen.getByText('Failed to load notes. Please try again.')).toBeInTheDocument();
    });

    it('renders the notes textarea when loaded successfully', () => {
        render(<NotesSection />);
        expect(screen.getByPlaceholderText('Notes')).toBeInTheDocument();
    });

    it('displays the notes content in the textarea', () => {
        useNotesSectionModule.default.mockReturnValue({ ...defaultState, notes: 'My notes' });
        render(<NotesSection />);
        expect(screen.getByDisplayValue('My notes')).toBeInTheDocument();
    });

    it('calls setNotes when the user types in the textarea', () => {
        const setNotes = vi.fn();
        useNotesSectionModule.default.mockReturnValue({ ...defaultState, setNotes });
        render(<NotesSection />);
        fireEvent.change(screen.getByPlaceholderText('Notes'), { target: { value: 'new note' } });
        expect(setNotes).toHaveBeenCalledWith('new note');
    });

    it('renders the save status indicator', () => {
        render(<NotesSection />);
        expect(document.querySelector('.save-status')).toBeInTheDocument();
    });

    it.each([
        ['saving', 'Saving...'],
        ['saved', 'Saved ✓'],
        ['error', 'Error saving ✗'],
    ])('renders the correct text for saveStatus "%s"', (status, text) => {
        useNotesSectionModule.default.mockReturnValue({ ...defaultState, saveStatus: status });
        render(<NotesSection />);
        expect(screen.getByText(text)).toBeInTheDocument();
    });

    it('renders a non-breaking space when saveStatus is empty', () => {
        render(<NotesSection />);
        expect(document.querySelector('.save-status').textContent).toBe('\u00A0');
    });

    it('applies the error class when saveStatus is "error"', () => {
        useNotesSectionModule.default.mockReturnValue({ ...defaultState, saveStatus: 'error' });
        render(<NotesSection />);
        expect(document.querySelector('.save-status')).toHaveClass('error');
    });

    it('does not apply the error class when saveStatus is not "error"', () => {
        render(<NotesSection />);
        expect(document.querySelector('.save-status')).not.toHaveClass('error');
    });
});