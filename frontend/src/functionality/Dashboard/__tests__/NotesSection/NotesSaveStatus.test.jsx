import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import NotesSaveStatus from '../../NotesSection/NotesSaveStatus.jsx';

vi.mock('../../stylesheets/NotesSection/NotesSaveStatus.css', () => ({}));

describe('NotesSaveStatus component', () => {
    it.each([
        ['saving', 'Saving...'],
        ['saved', 'Saved ✓'],
        ['error', 'Error saving ✗'],
    ])('renders "%s" text when saveStatus is "%s"', (status, expectedText) => {
        render(<NotesSaveStatus saveStatus={status} />);
        expect(screen.getByText(expectedText)).toBeInTheDocument();
    });

    it('renders a non-breaking space when saveStatus is empty', () => {
        const { container } = render(<NotesSaveStatus saveStatus="" />);
        expect(container.firstChild.textContent).toBe('\u00A0');
    });

    it('renders a non-breaking space when saveStatus is an unrecognised value', () => {
        const { container } = render(<NotesSaveStatus saveStatus="unknown" />);
        expect(container.firstChild.textContent).toBe('\u00A0');
    });

    it('applies the error class when saveStatus is "error"', () => {
        render(<NotesSaveStatus saveStatus="error" />);
        expect(screen.getByText('Error saving ✗')).toHaveClass('error');
    });

    it.each(['saving', 'saved', ''])(
        'does not apply the error class when saveStatus is "%s"',
        (status) => {
            render(<NotesSaveStatus saveStatus={status} />);
            expect(document.querySelector('.save-status')).not.toHaveClass('error');
        }
    );

    it('renders a span element', () => {
        const { container } = render(<NotesSaveStatus saveStatus="" />);
        expect(container.firstChild.tagName).toBe('SPAN');
    });
});