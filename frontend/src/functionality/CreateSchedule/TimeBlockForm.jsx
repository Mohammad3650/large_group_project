import './stylesheets/TimeBlockForm.css';
import { useTimeBlockForm } from './utils/Hooks/useTimeBlockForm';
import TimeBlockItem from './TimeBlockItem';
import FormActions from './FormActions';

/**
 * Main form for creating or editing time blocks.
 * Delegates state management to a custom hook (useTimeBlockForm)
 * to keep this component focused on rendering.
 *
 * Props:
 * @param {Function} onSubmit - Function to handle form submission
 * @param {boolean} loading - Indicates if submission is in progress
 * @param {Array} serverErrors - Errors returned from backend
 * @param {Function} clearErrors - Clears server-side errors
 * @param {Object|null} initialData - Existing block data (edit mode)
 * @param {Function|null} onCancel - Cancel handler (edit mode only)
 * 
 * @returns {JSX.Element}
 */

function TimeBlockForm({
    onSubmit,
    loading,
    serverErrors,
    clearErrors,
    initialData = null,
    onCancel = null
}) {
    const { date, setDate, blocks, addBlock, updateBlock, deleteBlock, handleSubmit } =
        useTimeBlockForm({ initialData, onSubmit, clearErrors });

    return (
        <form onSubmit={handleSubmit}>
            <div className='date-row'>
                {serverErrors[0]?.date && (
                    <p className="error-text-date">{serverErrors[0].date[0]}</p>
                )}
                <label>
                    Date
                </label>
                <input
                type="date"
                value={date}
                onChange={(e) => 
                    setDate(e.target.value)}
                />
            </div>
            
            {blocks.map((block, index) => (
                <TimeBlockItem
                    key={index}
                    block={block}
                    index={index}
                    serverErrors={serverErrors}
                    updateBlock={updateBlock}
                    deleteBlock={deleteBlock}
                    blocksLength={blocks.length}
                />
            ))}

            <FormActions
                initialData={initialData}
                onCancel={onCancel}
                loading={loading}
                addBlock={addBlock}
            />
        </form>
    );
}

export default TimeBlockForm;