import '../stylesheets/NotesSection/NotesTextArea.css';

/**
 * Renders the notes textarea input.
 *
 * @param {Object} props
 * @param {string} props.notes - The current notes value
 * @param {Function} props.setNotes - Setter to update notes
 * @returns {React.JSX.Element} The notes textarea
 */
function NotesTextArea({ notes, setNotes }) {
    return (
        <textarea
            className="notes-textarea"
            placeholder="Notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
        />
    );
}

export default NotesTextArea;