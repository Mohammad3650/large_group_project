import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ExportSection from '../ExportSection.jsx';

vi.mock('../stylesheets/ExportSection.css', () => ({}));
vi.mock('../../../components/ExportCsvButton.jsx', () => ({
    default: ({ setError }) => (
        <button data-testid="export-csv-button" onClick={() => setError('csv error')}>
            Export CSV
        </button>
    ),
}));
vi.mock('../../../components/ExportIcsButton.jsx', () => ({
    default: ({ setError }) => (
        <button data-testid="export-ics-button" onClick={() => setError('ics error')}>
            Export ICS
        </button>
    ),
}));

const renderExportSection = (props = {}) =>
    render(<ExportSection setError={vi.fn()} {...props} />);

describe('ExportSection component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the export heading', () => {
        renderExportSection();
        expect(screen.getByText('Export')).toBeInTheDocument();
    });

    it('renders the export CSV button', () => {
        renderExportSection();
        expect(screen.getByTestId('export-csv-button')).toBeInTheDocument();
    });

    it('renders the export ICS button', () => {
        renderExportSection();
        expect(screen.getByTestId('export-ics-button')).toBeInTheDocument();
    });

    it('passes setError to the CSV button', () => {
        const setError = vi.fn();
        renderExportSection({ setError });
        fireEvent.click(screen.getByTestId('export-csv-button'));
        expect(setError).toHaveBeenCalledWith('csv error');
    });

    it('passes setError to the ICS button', () => {
        const setError = vi.fn();
        renderExportSection({ setError });
        fireEvent.click(screen.getByTestId('export-ics-button'));
        expect(setError).toHaveBeenCalledWith('ics error');
    });
});