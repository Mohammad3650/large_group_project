/**
 * FormActions renders add event and create schedule buttons.
 * @param {Object} props
 * @param {function} props.addBlock
 * @param {function} props.handleSubmit
 * @param {boolean} props.loading
 * @returns {JSX.Element}
 */
function FormActions({ addBlock, handleSubmit, loading }) {
    return (
        <div className="time-block-form-btn">
            <button
                className="btn btn-secondary btn"
                type="button"
                onClick={addBlock}
            >
                Add Another Event
            </button>

            <button
                className="btn btn-primary"
                type="submit"
                disabled={loading}
            >
                {loading ? (
                    <>
                        <span className="spinner" /> Generating...
                    </>
                ) : (
                    'Create Schedule'
                )}
            </button>
        </div>
    );
}

export default FormActions;