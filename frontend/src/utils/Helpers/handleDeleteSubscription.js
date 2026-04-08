import deleteCalendarSubscription from '../Api/deleteCalendarSubscription.js';

async function handleDeleteSubscription(subscriptionId, { setSubscriptions, setError, refetchBlocks }) {
    try {
        setError('');
        await deleteCalendarSubscription(subscriptionId);

        setSubscriptions((currentSubscriptions) =>
            currentSubscriptions.filter(
                (subscription) => subscription.id !== subscriptionId
            )
        );

        await refetchBlocks();
    } catch {
        setError('Failed to delete timetable subscription');
    }
}

export default handleDeleteSubscription;