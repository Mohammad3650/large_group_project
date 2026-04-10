import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { useState } from 'react';
import useAutoSave from '../../../utils/Hooks/useAutoSave.js';

vi.mock('../../../utils/Api/saveNotes.js', () => ({ default: vi.fn() }));

import * as saveNotesModule from '../../../utils/Api/saveNotes.js';

function TestComponent({ loaded }) {
    const [content, setContent] = useState('');
    const [saveStatus, setSaveStatus] = useState('');

    useAutoSave(content, loaded, setSaveStatus);

    return (
        <div>
            <input
                placeholder="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
            />
            <span data-testid="status">{saveStatus}</span>
        </div>
    );
}

describe('useAutoSave', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers({ shouldAdvanceTime: true });
    });

    afterEach(async () => {
        await act(async () => { vi.runAllTimers(); });
        vi.useRealTimers();
    });

    it('does not trigger a save when loaded is false', async () => {
        saveNotesModule.default.mockResolvedValue({});
        render(<TestComponent loaded={false} />);
        await act(async () => {
            fireEvent.change(screen.getByPlaceholderText('content'), {
                target: { value: 'hello' },
            });
        });
        await act(async () => { vi.advanceTimersByTime(1000); });
        expect(saveNotesModule.default).not.toHaveBeenCalled();
    });

    it("sets saveStatus to 'saving' immediately when content changes and loaded is true", async () => {
        saveNotesModule.default.mockResolvedValue({});
        render(<TestComponent loaded={true} />);
        await act(async () => {
            fireEvent.change(screen.getByPlaceholderText('content'), {
                target: { value: 'hello' },
            });
        });
        expect(screen.getByTestId('status').textContent).toBe('saving');
    });

    it("sets saveStatus to 'saved' after the debounce period", async () => {
        saveNotesModule.default.mockResolvedValue({});
        render(<TestComponent loaded={true} />);
        await act(async () => {
            fireEvent.change(screen.getByPlaceholderText('content'), {
                target: { value: 'hello' },
            });
        });
        await act(async () => { vi.advanceTimersByTime(1000); });
        await waitFor(() =>
            expect(screen.getByTestId('status').textContent).toBe('saved')
        );
        expect(saveNotesModule.default).toHaveBeenCalledWith('hello');
    });

    it("sets saveStatus to 'error' when the API call fails", async () => {
        saveNotesModule.default.mockRejectedValue(new Error('Network error'));
        render(<TestComponent loaded={true} />);
        await act(async () => {
            fireEvent.change(screen.getByPlaceholderText('content'), {
                target: { value: 'hello' },
            });
        });
        await act(async () => { vi.advanceTimersByTime(1000); });
        await waitFor(() =>
            expect(screen.getByTestId('status').textContent).toBe('error')
        );
    });

    it('debounces — does not call the API until 1 second after the last keystroke', async () => {
        saveNotesModule.default.mockResolvedValue({});
        render(<TestComponent loaded={true} />);
        await act(async () => {
            fireEvent.change(screen.getByPlaceholderText('content'), {
                target: { value: 'A' },
            });
        });
        await act(async () => { vi.advanceTimersByTime(500); });
        await act(async () => {
            fireEvent.change(screen.getByPlaceholderText('content'), {
                target: { value: 'AB' },
            });
        });
        await act(async () => { vi.advanceTimersByTime(500); });
        expect(saveNotesModule.default).not.toHaveBeenCalled();
        await act(async () => { vi.advanceTimersByTime(500); });
        await waitFor(() => expect(saveNotesModule.default).toHaveBeenCalledTimes(1));
    });
});
