import useNotesSection from '../../../utils/Hooks/useNotesSection.js';
import NotesSaveStatus from './NotesSaveStatus.jsx';
import NotesTextArea from './NotesTextArea.jsx';
import NotesLoading from './NotesLoading.jsx';
import ErrorMessage from '../../../components/ErrorMessage.jsx';
import '../stylesheets/NotesSection.css';

/**
 * Renders the notes section with a textarea and save status indicator.
 * Handles loading and error states via sub-components.
 *
 * @returns {React.JSX.Element} The notes section layout
 */
function NotesSection() {
    const { notes, setNotes, loading, error, saveStatus } = useNotesSection();

    if (loading) return <NotesLoading />;
    if (error) return <ErrorMessage error={error} />;

    return (
        <div className="notes-section">
            <div className="notes-header">
                <NotesSaveStatus saveStatus={saveStatus} />
            </div>
            <NotesTextArea notes={notes} setNotes={setNotes} />
        </div>
    );
}

export default NotesSection;