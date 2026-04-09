from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import serializers
from rest_framework.response import Response

from scheduler.models import CalendarSubscription, TimeBlock
from scheduler.serializers.calendar_subscription_serializer import (
    CalendarSubscriptionSerializer,
)
from scheduler.services.calendar_subscription_sync import sync_calendar_subscription


def get_user_subscriptions(user):
    """
    Retrieve calendar subscriptions for a user in newest-first order.

    Args:
        user (User): Authenticated user.

    Returns:
        QuerySet: Ordered calendar subscriptions.
    """
    return CalendarSubscription.objects.filter(user=user).order_by("-created_at")


def list_calendar_subscriptions(user):
    """
    Build a response listing the user's subscriptions.

    Args:
        user (User): Authenticated user.

    Returns:
        Response: Serialized subscription list.
    """
    subscriptions = get_user_subscriptions(user)
    serializer = CalendarSubscriptionSerializer(subscriptions, many=True)
    return Response(serializer.data)


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
        raise serializers.ValidationError(
            {"source_url": ["You have already added this calendar subscription."]}
        )


def create_subscription(user, validated_data):
    """
    Create a calendar subscription for a user.

    Args:
        user (User): Authenticated user.
        validated_data (dict): Validated serializer data.

    Returns:
        CalendarSubscription: Newly created subscription.
    """
    return CalendarSubscription.objects.create(
        user=user,
        name=validated_data["name"],
        source_url=validated_data["source_url"],
    )


def create_and_sync_subscription(user, validated_data):
    """
    Create and immediately sync a new subscription.

    Args:
        user (User): Authenticated user.
        validated_data (dict): Validated serializer data.

    Returns:
        tuple[CalendarSubscription, dict]: Created subscription and sync result.
    """
    with transaction.atomic():
        subscription = create_subscription(user, validated_data)
        sync_result = sync_calendar_subscription(subscription)

    return subscription, sync_result


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


def get_imported_time_block_ids(subscription):
    """
    Get linked imported time block IDs for a subscription.

    Args:
        subscription (CalendarSubscription): Subscription being deleted.

    Returns:
        list[int]: Linked time block IDs.
    """
    imported_events = subscription.imported_events.select_related("time_block")
    return [event.time_block_id for event in imported_events]


def delete_subscription_time_blocks(user, time_block_ids):
    """
    Delete time blocks belonging to a user's subscription imports.

    Args:
        user (User): Authenticated user.
        time_block_ids (list[int]): Time block IDs to delete.

    Returns:
        None
    """
    TimeBlock.objects.filter(
        id__in=time_block_ids,
        day__user=user,
    ).delete()


def delete_subscription_with_imports(subscription, user):
    """
    Delete a subscription and its imported events and time blocks.

    Args:
        subscription (CalendarSubscription): Subscription to delete.
        user (User): Authenticated user.

    Returns:
        None
    """
    time_block_ids = get_imported_time_block_ids(subscription)

    with transaction.atomic():
        subscription.imported_events.all().delete()
        delete_subscription_time_blocks(user, time_block_ids)
        subscription.delete()