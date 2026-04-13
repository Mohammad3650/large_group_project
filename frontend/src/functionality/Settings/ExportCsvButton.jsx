import { FaFileCsv } from 'react-icons/fa';
import handleExportCsv from './utils/Api/handleExportCsv.js';
import './stylesheets/ExportButton.css';

/**
 * Button that triggers a CSV export of the user's schedule.
 *
 * @param {Object} props
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
            <FaFileCsv />
            Export CSV
        </button>
    );
}

export default ExportCsvButton;
