function formatSubscriptionLastSyncedAt(lastSyncedAt) {
    if (!lastSyncedAt) {
        return 'Never';
    }

    return new Date(lastSyncedAt).toLocaleString();
}

export default formatSubscriptionLastSyncedAt;