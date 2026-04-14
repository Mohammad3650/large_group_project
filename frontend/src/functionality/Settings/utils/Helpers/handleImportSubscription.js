import createCalendarSubscription from '../Api/createCalendarSubscription.js';

async function handleImportSubscription(payload, { setSubscriptions, setError, refetchBlocks }) {
    try {
        setError('');
        const responseData = await createCalendarSubscription(payload);
        setSubscriptions((currentSubscriptions) => [
            responseData.subscription,
            ...currentSubscriptions,
        ]);
        await refetchBlocks();
    } catch (requestError) {
        const detail =
            requestError?.response?.data?.source_url?.[0] ||
            requestError?.response?.data?.name?.[0] ||
            requestError?.response?.data?.message ||
            'Failed to import timetable';
        setError(detail);
    }
}

export default handleImportSubscription;