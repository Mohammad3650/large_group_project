import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { useState } from 'react';
import useAutoSave from '../useAutoSave.js';
import * as apiModule from '../../api.js';

vi.mock('../../api.js', () => ({
    api: {
        put: vi.fn()
    }
}));

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
        apiModule.api.put.mockResolvedValue({});
        render(<TestComponent loaded={false} />);

        await act(async () => {
            fireEvent.change(screen.getByPlaceholderText('content'), {
                target: { value: 'hello' }
            });
        });
        await act(async () => { vi.advanceTimersByTime(1000); });

        expect(apiModule.api.put).not.toHaveBeenCalled();
    });

    it("sets saveStatus to 'saving' immediately when content changes", async () => {
        apiModule.api.put.mockResolvedValue({});
        render(<TestComponent loaded={true} />);

        await act(async () => {
            fireEvent.change(screen.getByPlaceholderText('content'), {
                target: { value: 'hello' }
            });
        });

        expect(screen.getByTestId('status').textContent).toBe('saving');
    });

    it("sets saveStatus to 'saved' after debounce period", async () => {
        apiModule.api.put.mockResolvedValue({});
        render(<TestComponent loaded={true} />);

        await act(async () => {
            fireEvent.change(screen.getByPlaceholderText('content'), {
                target: { value: 'hello' }
            });
        });
        await act(async () => { vi.advanceTimersByTime(1000); });

        await waitFor(() =>
            expect(screen.getByTestId('status').textContent).toBe('saved')
        );
        expect(apiModule.api.put).toHaveBeenCalledWith('/api/notes/save/', {
            content: 'hello'
        });
    });

    it("sets saveStatus to 'error' and logs when save fails", async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        apiModule.api.put.mockRejectedValue(new Error('Network error'));
        render(<TestComponent loaded={true} />);

        await act(async () => {
            fireEvent.change(screen.getByPlaceholderText('content'), {
                target: { value: 'hello' }
            });
        });
        await act(async () => { vi.advanceTimersByTime(1000); });

        await waitFor(() =>
            expect(screen.getByTestId('status').textContent).toBe('error')
        );
        expect(consoleSpy).toHaveBeenCalledWith(
            'Failed to save notes',
            expect.any(Error)
        );
        consoleSpy.mockRestore();
    });

    it('debounces — does not call the API until 1 second after the last keystroke', async () => {
        apiModule.api.put.mockResolvedValue({});
        render(<TestComponent loaded={true} />);

        await act(async () => {
            fireEvent.change(screen.getByPlaceholderText('content'), {
                target: { value: 'A' }
            });
        });
        await act(async () => { vi.advanceTimersByTime(500); });
        await act(async () => {
            fireEvent.change(screen.getByPlaceholderText('content'), {
                target: { value: 'AB' }
            });
        });
        await act(async () => { vi.advanceTimersByTime(500); });

        expect(apiModule.api.put).not.toHaveBeenCalled();

        await act(async () => { vi.advanceTimersByTime(500); });
        await waitFor(() => expect(apiModule.api.put).toHaveBeenCalledTimes(1));
    });
});