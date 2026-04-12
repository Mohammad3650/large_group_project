import refreshCalendarSubscription from '../../functionality/Dashboard/utils/api/refreshCalendarSubscription.js';

async function handleRefreshSubscription(subscriptionId, { setSubscriptions, setError, refetchBlocks }) {
    try {
        setError('');
        const responseData = await refreshCalendarSubscription(subscriptionId);

        setSubscriptions((currentSubscriptions) =>
            currentSubscriptions.map((subscription) =>
                subscription.id === subscriptionId
                    ? responseData.subscription
                    : subscription
            )
        );

        await refetchBlocks();
    } catch {
        setError('Failed to refresh timetable subscription');
    }
}

export default handleRefreshSubscription;