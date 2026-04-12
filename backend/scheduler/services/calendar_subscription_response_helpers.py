from scheduler.serializers.calendar_subscription_serializer import (
    CalendarSubscriptionSerializer,
)


def build_subscription_response_data(subscription, sync_result, message):
    """
    Build a standard subscription response payload.

    Args:
        subscription (CalendarSubscription): Subscription to serialize.
        sync_result (dict): Sync summary.
        message (str): Success message.

    Returns:
        dict: Response payload.
    """
    serializer = CalendarSubscriptionSerializer(subscription)
    return {
        "subscription": serializer.data,
        "sync_result": sync_result,
        "message": message,
    }


def build_message_response(message):
    """
    Build a standard message-only payload.

    Args:
        message (str): Response message.

    Returns:
        dict: Message payload.
    """
    return {"message": message}