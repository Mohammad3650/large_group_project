import { useState } from 'react';

/**
 * Render the calendar subscription import form.
 *
 * @param {Object} props - Component props
 * @param {Function} props.onImport - Import handler
 * @returns {JSX.Element} The subscription form
 */
function SubscriptionForm({ onImport }) {
    const [name, setName] = useState('');
    const [sourceUrl, setSourceUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');


/**
 * Reset form fields after a successful import.
 */
function resetForm() {
    setName('');
    setSourceUrl('');
}

/**
 * Clear local feedback messages.
 */
function clearMessages() {
    setSuccessMessage('');
    setErrorMessage('');
}

    /**
     * Handle timetable subscription form submission.
     *
     * @param {SubmitEvent} event - Form submit event
     * @returns {Promise<void>}
     */
    async function handleSubmit(event) {
        event.preventDefault();

        if (loading) return;

        clearMessages();
        setLoading(true);

        try {
            await onImport({ name, sourceUrl });
            resetForm();
            setSuccessMessage('Timetable imported successfully.');
        } catch {
            setErrorMessage('Failed to import timetable.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <form className="subscription-form" onSubmit={handleSubmit}>
            <h2 className="subscription-title">Subscribe to timetable</h2>

            {successMessage && (
                <p className="subscription-success-text">{successMessage}</p>
            )}

            {errorMessage && (
                <p className="subscription-error-text">{errorMessage}</p>
            )}

            <input
                type="text"
                className="subscription-input"
                placeholder="Subscription name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
            />

            <input
                type="url"
                className="subscription-input"
                placeholder="ICS or webcal URL"
                value={sourceUrl}
                onChange={(event) => setSourceUrl(event.target.value)}
                required
            />

            <button
                type="submit"
                className="subscription-button"
                disabled={loading}
            >
                {loading ? 'Importing...' : 'Import timetable'}
            </button>
        </form>
    );
}

export default SubscriptionForm;
