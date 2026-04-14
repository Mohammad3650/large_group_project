import { FaCalendarAlt } from 'react-icons/fa';
import handleExportIcs from './utils/Api/handleExportIcs.js';
import './stylesheets/ExportButton.css';

/**
 * Button that triggers an ICS export of the user's schedule.
 *
 * @param {Object} props
 * @param {Function} props.setError - Setter for the error message state
 * @returns {JSX.Element} The export ICS button
 */
function ExportIcsButton({ setError }) {
    return (
        <button
            type="button"
            className="export-csv-button"
            onClick={() => handleExportIcs(setError)}
        >
            <FaCalendarAlt />
            Export ICS
        </button>
    );
}

export default ExportIcsButton;
