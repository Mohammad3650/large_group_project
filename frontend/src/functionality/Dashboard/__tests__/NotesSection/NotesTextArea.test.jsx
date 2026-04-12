import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import NotesTextArea from '../../NotesSection/NotesTextArea.jsx';

vi.mock('../../stylesheets/NotesSection/NotesTextArea.css', () => ({}));

describe('NotesTextArea component', () => {
    it('renders the notes textarea', () => {
        render(<NotesTextArea notes="" setNotes={vi.fn()} />);
        expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('renders with the correct placeholder', () => {
        render(<NotesTextArea notes="" setNotes={vi.fn()} />);
        expect(screen.getByPlaceholderText('Notes')).toBeInTheDocument();
    });

    it('displays the current notes value', () => {
        render(<NotesTextArea notes="Hello world" setNotes={vi.fn()} />);
        expect(screen.getByDisplayValue('Hello world')).toBeInTheDocument();
    });

    it('calls setNotes with the new value when the user types', () => {
        const setNotes = vi.fn();
        render(<NotesTextArea notes="" setNotes={setNotes} />);
        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'new note' } });
        expect(setNotes).toHaveBeenCalledWith('new note');
    });
});