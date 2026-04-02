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
 * @param {string} [props.feedbackMessage] - Parent-provided feedback message
 * @param {string} [props.feedbackType] - Parent-provided feedback type
 * @returns {JSX.Element} The subscription form
 */
function SubscriptionForm({
    onImport,
    feedbackMessage = '',
    feedbackType = '',
}) {
    const [name, setName] = useState('');
    const [sourceUrl, setSourceUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [localFeedbackMessage, setLocalFeedbackMessage] = useState('');
    const [localFeedbackType, setLocalFeedbackType] = useState('');

    const hasParentFeedback = Boolean(feedbackMessage);

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
    function clearLocalFeedback() {
        setLocalFeedbackMessage('');
        setLocalFeedbackType('');
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
     * Handle timetable subscription form submission.
     *
     * @param {Event} event - Form submit event
     * @returns {Promise<void>}
     */
    async function handleSubmit(event) {
        event.preventDefault();

        if (loading) return;

        clearLocalFeedback();
        setLoading(true);

        try {
            await onImport(buildPayload());
            resetForm();

            if (!feedbackMessage) {
                setLocalFeedbackMessage('Timetable imported successfully.');
                setLocalFeedbackType('success');
            }
        } catch (error) {
            if (!feedbackMessage) {
                const backendMessage =
                    error?.response?.data?.source_url?.[0] ||
                    error?.response?.data?.name?.[0] ||
                    error?.response?.data?.message ||
                    error?.response?.data?.detail ||
                    'Failed to import timetable.';

                setLocalFeedbackMessage(backendMessage);
                setLocalFeedbackType('error');
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <form className="subscription-form" onSubmit={handleSubmit}>
            <h2 className="subscription-title">Subscribe to timetable</h2>

            {!hasParentFeedback && localFeedbackMessage && localFeedbackType === 'success' && (
                <p className="subscription-success-text">{localFeedbackMessage}</p>
            )}

            {!hasParentFeedback && localFeedbackMessage && localFeedbackType === 'error' && (
                <p className="subscription-error-text">{localFeedbackMessage}</p>
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