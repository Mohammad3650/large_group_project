import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import NotesLoading from '../../NotesSection/NotesLoading.jsx';

describe('NotesLoading component', () => {
    it('renders the loading message', () => {
        render(<NotesLoading />);
        expect(screen.getByText('Loading notes...')).toBeInTheDocument();
    });

    it('renders a paragraph element', () => {
        const { container } = render(<NotesLoading />);
        expect(container.firstChild.tagName).toBe('P');
    });
});