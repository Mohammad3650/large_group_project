import '../stylesheets/NotesSaveStatus.css';

/**
 * Displays the current save status of the notes.
 *
 * @param {Object} props
 * @param {string} props.saveStatus - Current save status ('saving', 'saved', 'error', or '')
 * @returns {React.JSX.Element} - The notes save status text
 */
function NotesSaveStatus({ saveStatus }) {
    const statusText = {
        saving: 'Saving...',
        error: 'Error saving ✗',
        saved: 'Saved ✓',
    }[saveStatus] || '\u00A0';

    return (
        <span className={`save-status ${saveStatus === 'error' ? 'error' : ''}`}>
            {statusText}
        </span>
    );
}

export default NotesSaveStatus;
