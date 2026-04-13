const fallbackMessage = 'Failed to import timetable.';

function getSubscriptionFeedbackMessage(error) {
    return (
        error?.response?.data?.source_url?.[0] ||
        error?.response?.data?.name?.[0] ||
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        fallbackMessage
    );
}

export default getSubscriptionFeedbackMessage;