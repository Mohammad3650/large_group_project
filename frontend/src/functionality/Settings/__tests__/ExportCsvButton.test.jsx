import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ExportCsvButton from '../ExportCsvButton.jsx';
import handleExportCsv from '../utils/Api/handleExportCsv.js';

vi.mock('../utils/Api/handleExportCsv.js', () => ({
    default: vi.fn()
}));

describe('ExportCsvButton', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the export csv button text', () => {
        render(<ExportCsvButton setError={vi.fn()} />);

        expect(
            screen.getByRole('button', { name: /export csv/i })
        ).toBeInTheDocument();
    });

    it('calls handleExportCsv with setError when clicked', () => {
        const setError = vi.fn();

        render(<ExportCsvButton setError={setError} />);

        fireEvent.click(screen.getByRole('button', { name: /export csv/i }));

        expect(handleExportCsv).toHaveBeenCalledTimes(1);
        expect(handleExportCsv).toHaveBeenCalledWith(setError);
    });
});