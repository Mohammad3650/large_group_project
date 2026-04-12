from django.db import transaction

from scheduler.models import CalendarSubscription, TimeBlock
from scheduler.services.calendar_subscription_sync import sync_calendar_subscription


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