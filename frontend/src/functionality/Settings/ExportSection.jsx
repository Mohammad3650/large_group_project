import ExportCsvButton from '../../components/ExportCsvButton.jsx';
import ExportIcsButton from '../../components/ExportIcsButton.jsx';
import './stylesheets/ExportSection.css';

/**
 * Settings section for exporting the user's schedule data.
 *
 * @param {Object} props
 * @param {Function} props.setError - Setter for the error message state
 * @returns {JSX.Element} The export settings section
 */
function ExportSection({ setError }) {
    return (
        <div className="settings-section">
            <h2>Export</h2>
            <div className="settings-export-buttons">
                <ExportCsvButton setError={setError} />
                <ExportIcsButton setError={setError} />
            </div>
        </div>
    );
}

export default ExportSection;
