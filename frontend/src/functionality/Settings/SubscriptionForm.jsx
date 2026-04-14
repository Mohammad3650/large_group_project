import { useState } from 'react';
import { FaCloudDownloadAlt } from 'react-icons/fa';
import getSubscriptionFeedbackMessage from './utils/Helpers/getSubscriptionFeedbackMessage.js';
import './stylesheets/SubscriptionForm.css';

/**
 * Reusable input field for the subscription form.
 *
 * @param {Object} props
 * @param {string} props.type
 * @param {string} props.placeholder
 * @param {string} props.value
 * @param {Function} props.onChange
 * @returns {JSX.Element}
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

function createFeedback(message = '', type = '') {
    return { message, type };
}

function SubscriptionFeedback({ feedback }) {
    if (!feedback.message) {
        return null;
    }

    return (
        <p
            className={
                feedback.type === 'success'
                    ? 'subscription-success-text'
                    : 'subscription-error-text'
            }
        >
            {feedback.message}
        </p>
    );
}

/**
 * Render the calendar subscription import form.
 *
 * @param {Object} props
 * @param {Function} props.onImport
 * @param {string} [props.feedbackMessage]
 * @param {string} [props.feedbackType]
 * @returns {JSX.Element}
 */
function SubscriptionForm({
    onImport,
    feedbackMessage = '',
    feedbackType = ''
}) {
    const [name, setName] = useState('');
    const [sourceUrl, setSourceUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [localFeedback, setLocalFeedback] = useState(createFeedback());

    const hasParentFeedback = Boolean(feedbackMessage);

    function resetForm() {
        setName('');
        setSourceUrl('');
    }

    function clearLocalFeedback() {
        setLocalFeedback(createFeedback());
    }

    function buildPayload() {
        return { name, sourceUrl };
    }

    function setSuccessFeedback() {
        setLocalFeedback(
            createFeedback('Timetable imported successfully.', 'success')
        );
    }

    function setErrorFeedback(error) {
        setLocalFeedback(
            createFeedback(getSubscriptionFeedbackMessage(error), 'error')
        );
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

            if (!hasParentFeedback) {
                setSuccessFeedback();
            }
        } catch (error) {
            if (!hasParentFeedback) {
                setErrorFeedback(error);
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <form className="subscription-form" onSubmit={handleSubmit}>
            <h2 className="subscription-title">Subscribe to Timetable</h2>

            {!hasParentFeedback && <SubscriptionFeedback feedback={localFeedback} />}

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