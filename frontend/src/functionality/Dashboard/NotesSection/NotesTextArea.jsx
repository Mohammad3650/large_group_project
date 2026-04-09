import '../stylesheets/NotesSection/NotesTextArea.css';

/**
 * Renders the notes textarea input.
 *
 * @param {Object} props
 * @param {string} props.notes - The current notes value
 * @param {Function} props.setNotes - Setter to update notes
 * @returns {React.JSX.Element} The notes area
 */
function NotesTextArea({ notes, setNotes }) {
    return (
        <textarea
            className="notes-textarea"
            placeholder="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
        />
    );
}

export default NotesTextArea;