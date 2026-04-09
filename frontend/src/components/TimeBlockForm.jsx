import './stylesheets/TimeBlockForm.css';
import TimeBlockItem from './TimeBlockItem';
import FormActions from './FormActions';
import useTimeBlockForm from '../utils/Hooks/useTimeBlockForm';

function TimeBlockForm({
    onSubmit,
    loading = false,
    serverErrors = [],
    clearErrors = () => {},
    initialData = null,
    onCancel = null
}) {
    const {
        date,
        blocks,
        updateDate,
        addBlock,
        updateBlock,
        deleteBlock,
        submitForm,
        isEditMode
    } = useTimeBlockForm({
        onSubmit,
        clearErrors,
        initialData
    });

    return (
        <form onSubmit={submitForm}>
            {serverErrors?.[0]?.date && (
                <p className="error-text-date">{serverErrors[0].date[0]}</p>
            )}

            <input
                type="date"
                value={date || ''}
                onChange={updateDate}
            />

            {(blocks || []).map((block, index) => (
                <TimeBlockItem
                    key={block.id || index}
                    block={block}
                    index={index}
                    serverErrors={serverErrors}
                    updateBlock={updateBlock}
                    deleteBlock={deleteBlock}
                    blocksLength={blocks?.length || 0}
                />
            ))}

            {!isEditMode ? (
                <FormActions
                    addBlock={addBlock}
                    loading={loading}
                />
            ) : (
                <div className="time-block-form-btn">
                    {onCancel && (
                        <button
                            className="btn cancel-btn"
                            type="button"
                            onClick={onCancel}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                    )}

                    <button
                        className="btn edit-btn"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Edit Time Block'}
                    </button>
                </div>
            )}
        </form>
    );
}

export default TimeBlockForm;