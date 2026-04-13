import ExportCsvButton from './ExportCsvButton.jsx';
import ExportIcsButton from './ExportIcsButton.jsx';
import './stylesheets/ExportSection.css';

/**
 * Settings section for exporting the user's schedule data.
 *
 * @param {Object} props
 * @param {Function} props.setError
 * @returns {React.JSX.Element}
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