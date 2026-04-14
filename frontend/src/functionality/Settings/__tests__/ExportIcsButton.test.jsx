import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ExportIcsButton from '../ExportIcsButton.jsx';
import handleExportIcs from '../utils/Api/handleExportIcs.js';

vi.mock('../utils/Api/handleExportIcs.js', () => ({
    default: vi.fn()
}));

describe('ExportIcsButton', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the export ics button text', () => {
        render(<ExportIcsButton setError={vi.fn()} />);

        expect(
            screen.getByRole('button', { name: /export ics/i })
        ).toBeInTheDocument();
    });

    it('calls handleExportIcs with setError when clicked', () => {
        const setError = vi.fn();

        render(<ExportIcsButton setError={setError} />);

        fireEvent.click(screen.getByRole('button', { name: /export ics/i }));

        expect(handleExportIcs).toHaveBeenCalledTimes(1);
        expect(handleExportIcs).toHaveBeenCalledWith(setError);
    });
});