import { useState } from 'react';
import { FaCloudDownloadAlt } from 'react-icons/fa';
import getSubscriptionFeedbackMessage from '../../utils/Helpers/getSubscriptionFeedbackMessage.js';
import './stylesheets/SubscriptionForm.css';

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
    feedbackType = ''
}) {
    const [name, setName] = useState('');
    const [sourceUrl, setSourceUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [localFeedback, setLocalFeedback] = useState({
        message: '',
        type: ''
    });

    const hasParentFeedback = Boolean(feedbackMessage);

    function resetForm() {
        setName('');
        setSourceUrl('');
    }

    function clearLocalFeedback() {
        setLocalFeedback({
            message: '',
            type: ''
        });
    }

    function buildPayload() {
        return { name, sourceUrl };
    }

    function setSuccessFeedback() {
        setLocalFeedback({
            message: 'Timetable imported successfully.',
            type: 'success'
        });
    }

    function setErrorFeedback(error) {
        setLocalFeedback({
            message: getSubscriptionFeedbackMessage(error),
            type: 'error'
        });
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (loading) {
            return;
        }

        clearLocalFeedback();
        setLoading(true);

        try {
            await onImport(buildPayload());
            resetForm();

            if (!feedbackMessage) {
                setSuccessFeedback();
            }
        } catch (error) {
            if (!feedbackMessage) {
                setErrorFeedback(error);
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <form className="subscription-form" onSubmit={handleSubmit}>
            <h2 className="subscription-title">Subscribe to timetable</h2>

            {!hasParentFeedback && localFeedback.message && (
                <p
                    className={
                        localFeedback.type === 'success'
                            ? 'subscription-success-text'
                            : 'subscription-error-text'
                    }
                >
                    {localFeedback.message}
                </p>
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
                <FaCloudDownloadAlt />
                {loading ? 'Importing...' : 'Import timetable'}
            </button>
        </form>
    );
}

export default SubscriptionForm;