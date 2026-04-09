import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('../stylesheets/TaskSearchBar.css', () => ({}));
vi.mock('react-icons/fa', () => ({ FaSearch: () => <span data-testid="search-icon" /> }));

import TaskSearchBar from '../TaskSearchBar.jsx';

describe('Tests for TaskSearchBar', () => {
    it('renders the search input', () => {
        render(<TaskSearchBar searchTerm="" setSearchTerm={vi.fn()} />);
        expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('renders the search icon', () => {
        render(<TaskSearchBar searchTerm="" setSearchTerm={vi.fn()} />);
        expect(screen.getByTestId('search-icon')).toBeInTheDocument();
    });

    it('displays the current search term in the input', () => {
        render(<TaskSearchBar searchTerm="lecture" setSearchTerm={vi.fn()} />);
        expect(screen.getByRole('textbox')).toHaveValue('lecture');
    });

    it('displays the correct placeholder text', () => {
        render(<TaskSearchBar searchTerm="" setSearchTerm={vi.fn()} />);
        expect(screen.getByPlaceholderText('Search tasks...')).toBeInTheDocument();
    });

    it('calls setSearchTerm with the new value when the input changes', () => {
        const setSearchTerm = vi.fn();
        render(<TaskSearchBar searchTerm="" setSearchTerm={setSearchTerm} />);
        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'study' } });
        expect(setSearchTerm).toHaveBeenCalledWith('study');
    });
});
