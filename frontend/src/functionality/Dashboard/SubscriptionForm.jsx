import { useState } from 'react';

/**
 * Reusable input field for the subscription form.
 *
 * @param {Object} props - Component props
 * @param {string} props.type - Input type
 * @param {string} props.placeholder - Input placeholder
 * @param {string} props.value - Current input value
 * @param {Function} props.onChange - Change handler
 * @returns {JSX.Element} Subscription form input
 */
function SubscriptionInput({ type, placeholder, value, onChange }) {
    return (
        <input
            type={type}
            className="subscription-input"
            placeholder={placeholder}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            required
        />
    );
}

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
     * Build the payload sent to the import handler.
     *
     * @returns {{name: string, sourceUrl: string}} Subscription payload
     */
    function buildPayload() {
        return { name, sourceUrl };
    }

    /**
     * Handle a successful timetable import.
     */
    function handleImportSuccess() {
        resetForm();
        setSuccessMessage('Timetable imported successfully.');
    }

    /**
     * Handle a failed timetable import.
     */
    function handleImportFailure() {
        setErrorMessage('Failed to import timetable.');
    }

    /**
     * Handle timetable subscription form submission.
     *
     * @param {Event} event - Form submit event
     * @returns {Promise<void>}
     */
    async function handleSubmit(event) {
        event.preventDefault();

        if (loading) return;

        clearMessages();
        setLoading(true);

        try {
            await onImport(buildPayload());
            handleImportSuccess();
        } catch {
            handleImportFailure();
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

            <SubscriptionInput
                type="text"
                placeholder="Subscription name"
                value={name}
                onChange={setName}
            />

            <SubscriptionInput
                type="url"
                placeholder="ICS or webcal URL"
                value={sourceUrl}
                onChange={setSourceUrl}
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