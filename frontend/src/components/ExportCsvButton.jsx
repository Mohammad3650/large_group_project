import handleExportCsv from '../utils/Api/handleExportCsv.js';
import './stylesheets/ExportButton.css';

/**
 * Button that triggers a CSV export of the user's schedule.
 *
 * @param {object} props
 * @param {Function} props.setError - Setter for the error message state
 * @returns {JSX.Element} The export CSV button
 */
function ExportCsvButton({ setError }) {
    return (
        <button
            type="button"
            className="export-csv-button"
            onClick={() => handleExportCsv(setError)}
        >
            Export CSV
        </button>
    );
}

export default ExportCsvButton;
