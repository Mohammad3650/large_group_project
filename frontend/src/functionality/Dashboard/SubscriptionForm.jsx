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

    async function handleSubmit(event) {
        event.preventDefault();
        await onImport({ name, sourceUrl });
        setName('');
        setSourceUrl('');
    }

    return (
        <form className="subscription-form" onSubmit={handleSubmit}>
            <h2 className="subscription-title">Subscribe to timetable</h2>

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

            <button type="submit" className="subscription-button">
                Import timetable
            </button>
        </form>
    );
}

export default SubscriptionForm;
