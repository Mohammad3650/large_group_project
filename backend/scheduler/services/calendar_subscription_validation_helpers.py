from rest_framework import serializers

from scheduler.models import CalendarSubscription

DUPLICATE_SUBSCRIPTION_ERROR = {
    "source_url": ["You have already added this calendar subscription."]
}


def subscription_exists(user, source_url):
    """
    Check whether a user already has a subscription for a source URL.

    Args:
        user (User): Authenticated user.
        source_url (str): Subscription URL.

    Returns:
        bool: True if the subscription already exists.
    """
    return CalendarSubscription.objects.filter(
        user=user,
        source_url=source_url,
    ).exists()


def validate_unique_subscription(user, source_url):
    """
    Raise a validation error if the subscription already exists.

    Args:
        user (User): Authenticated user.
        source_url (str): Subscription URL.

    Returns:
        None
    """
    if subscription_exists(user, source_url):
        raise serializers.ValidationError(DUPLICATE_SUBSCRIPTION_ERROR)
