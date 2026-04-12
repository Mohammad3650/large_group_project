from django.shortcuts import get_object_or_404
from rest_framework.response import Response

from scheduler.models import CalendarSubscription
from scheduler.serializers.calendar_subscription_serializer import (
    CalendarSubscriptionSerializer,
)


def get_user_subscriptions(user):
    """
    Retrieve calendar subscriptions for a user in newest-first order.

    Args:
        user (User): Authenticated user.

    Returns:
        QuerySet: Ordered calendar subscriptions.
    """
    return CalendarSubscription.objects.filter(user=user).order_by("-created_at")


def serialise_subscriptions(subscriptions):
    """
    Serialise a subscription queryset.

    Args:
        subscriptions (QuerySet[CalendarSubscription]): Subscriptions to serialise.

    Returns:
        list[dict]: Serialised subscription data.
    """
    serializer = CalendarSubscriptionSerializer(subscriptions, many=True)
    return serializer.data


def list_calendar_subscriptions(user):
    """
    Build a response listing the user's subscriptions.

    Args:
        user (User): Authenticated user.

    Returns:
        Response: Serialized subscription list.
    """
    subscriptions = get_user_subscriptions(user)
    return Response(serialise_subscriptions(subscriptions))


def get_user_subscription_or_404(user, subscription_id):
    """
    Retrieve a user's subscription or raise 404.

    Args:
        user (User): Authenticated user.
        subscription_id (int): Subscription identifier.

    Returns:
        CalendarSubscription: Matching subscription.
    """
    return get_object_or_404(
        CalendarSubscription,
        id=subscription_id,
        user=user,
    )