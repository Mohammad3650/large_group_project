/**
 * Handles all action buttons for the TimeBlockForm.
 * - Shows "Add Another Event" only when creating new blocks
 * - Shows "Cancel" only when editing an existing block
 * - Submit button adapts based on create/edit mode and loading state
 *
 * Props:
 * @param {Object|null} initialData - Existing block data (if editing), null if creating
 * @param {Function|null} onCancel - Callback to cancel editing
 * @param {boolean} loading - Indicates if a submit request is in progress
 * @param {Function} addBlock - Adds a new empty time block
 */

function FormActions({ initialData, onCancel, loading, addBlock }) {
    return (
        <div className="time-block-form-btn">
            {!initialData && (
                <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={addBlock}
                >
                    Add Another Event
                </button>
            )}

            {initialData && onCancel && (
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
                className={`btn ${initialData ? 'edit-btn' : 'btn-primary'}`}
                type="submit"
                disabled={loading}
            >
                {loading ? (
                    <><span className="spinner" /> Saving...</>
                ) : initialData ? (
                    'Edit Time Block'
                ) : (
                    'Create Time Block'
                )}
            </button>
        </div>
    );
}

export default FormActions;