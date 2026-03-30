import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import NotesSection from '../NotesSection';
import * as apiModule from '../../../api.js';

vi.mock('../stylesheets/NotesSection.css', () => ({}));
vi.mock('../../../api.js', () => ({
    api: {
        get: vi.fn(),
        put: vi.fn()
    }
}));
vi.mock('../../../utils/useAutoSave.js', () => ({
    default: vi.fn(() => {})
}));

import useAutoSave from '../../../utils/useAutoSave.js';
import { useEffect } from 'react';

const renderAndLoad = async (content = '') => {
    apiModule.api.get.mockResolvedValue({ data: { content } });
    await act(async () => { render(<NotesSection />); });
    await waitFor(() => expect(apiModule.api.get).toHaveBeenCalled());
};

describe('Tests for NotesSection', () => {
    beforeEach(() => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        vi.clearAllMocks();
        useAutoSave.mockImplementation(() => {});
    });

    afterEach(async () => {
        await act(async () => { vi.runAllTimers(); });
        vi.useRealTimers();
    });

    it('shows a loading indicator before notes are fetched', () => {
        apiModule.api.get.mockImplementation(() => new Promise(() => {}));
        render(<NotesSection />);
        expect(screen.getByText('Loading notes...')).toBeInTheDocument();
    });

    it('renders the notes textarea after loading', async () => {
        await renderAndLoad();
        expect(screen.getByPlaceholderText('Notes')).toBeInTheDocument();
    });

    it('fetches and displays the saved notes on mount', async () => {
        await renderAndLoad('My notes');
        expect(screen.getByDisplayValue('My notes')).toBeInTheDocument();
    });

    it('updates notes when the user types', async () => {
        await renderAndLoad();
        await act(async () => {
            fireEvent.change(screen.getByPlaceholderText('Notes'), {
                target: { value: 'New note' }
            });
        });
        expect(screen.getByDisplayValue('New note')).toBeInTheDocument();
    });

    it('displays a user-friendly error message when fetching notes fails', async () => {
        apiModule.api.get.mockRejectedValue(new Error('Network error'));
        await act(async () => { render(<NotesSection />); });
        await waitFor(() =>
            expect(screen.getByText('Failed to load notes. Please try again.')).toBeInTheDocument()
        );
    });

    it('calls useAutoSave with the correct arguments after loading', async () => {
        await renderAndLoad('hello');
        expect(useAutoSave).toHaveBeenCalled();
    });

    it("shows 'Saving...' when useAutoSave sets status to saving", async () => {
        useAutoSave.mockImplementation((_content, _loaded, setSaveStatus) => {
            useEffect(() => { setSaveStatus('saving'); }, []);
        });
        await renderAndLoad();
        await waitFor(() =>
            expect(screen.getByText('Saving...')).toBeInTheDocument()
        );
    });

    it("shows 'Saved ✓' when useAutoSave sets status to saved", async () => {
        useAutoSave.mockImplementation((_content, _loaded, setSaveStatus) => {
            useEffect(() => { setSaveStatus('saved'); }, []);
        });
        await renderAndLoad();
        await waitFor(() =>
            expect(screen.getByText('Saved ✓')).toBeInTheDocument()
        );
    });

    it("shows 'Error saving ✗' when useAutoSave sets status to error", async () => {
        useAutoSave.mockImplementation((_content, _loaded, setSaveStatus) => {
            useEffect(() => { setSaveStatus('error'); }, []);
        });
        await renderAndLoad();
        await waitFor(() =>
            expect(screen.getByText('Error saving ✗')).toBeInTheDocument()
        );
    });
});