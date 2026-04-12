from django.db import transaction
from django.utils import timezone

from scheduler.models import ImportedCalendarEvent
from scheduler.services.calendar_subscription_event_time_helpers import (
    get_event_date,
    should_import_event,
)
from scheduler.services.calendar_subscription_sync_result_helpers import (
    build_sync_result,
    record_sync_outcome,
)
from scheduler.services.calendar_subscription_time_block_helpers import (
    build_external_event_uid,
    build_time_block_data,
)
from scheduler.services.ics_fetcher import fetch_ics_content
from scheduler.services.ics_parser import parse_ics_events
from scheduler.services.time_block_service import (
    create_time_block,
    get_or_create_dayplan,
    update_time_block,
)


def get_existing_imported_event(subscription, external_event_uid):
    """
    Retrieve an existing imported calendar event for a subscription.

    Args:
        subscription (CalendarSubscription): Subscription being synced.
        external_event_uid (str): Stable external event identifier.

    Returns:
        ImportedCalendarEvent | None: Matching imported event if it exists.
    """
    return (
        ImportedCalendarEvent.objects.filter(
            subscription=subscription,
            external_event_uid=external_event_uid,
        )
        .select_related("time_block")
        .first()
    )


def create_imported_event(
    subscription,
    external_event_uid,
    dayplan,
    timeblock_data,
):
    """
    Create a new imported event and linked TimeBlock.

    Args:
        subscription (CalendarSubscription): Subscription being synced.
        external_event_uid (str): Stable external event identifier.
        dayplan (DayPlan): Target day plan.
        timeblock_data (dict): TimeBlock payload.

    Returns:
        None
    """
    time_block = create_time_block(dayplan, timeblock_data, str(dayplan.date))
    ImportedCalendarEvent.objects.create(
        subscription=subscription,
        external_event_uid=external_event_uid,
        time_block=time_block,
    )


def update_imported_event(imported_event, dayplan, timeblock_data):
    """
    Update the linked TimeBlock for an existing imported event.

    Args:
        imported_event (ImportedCalendarEvent): Existing imported event mapping.
        dayplan (DayPlan): Target day plan.
        timeblock_data (dict): Updated TimeBlock payload.

    Returns:
        None
    """
    update_time_block(
        imported_event.time_block,
        dayplan,
        timeblock_data,
        str(dayplan.date),
    )


def sync_single_event(subscription, event):
    """
    Sync a single parsed ICS event into StudySync.

    Args:
        subscription (CalendarSubscription): Subscription being synced.
        event (dict): Parsed ICS event.

    Returns:
        str: One of "created", "updated", or "skipped".
    """
    if not should_import_event(event):
        return "skipped"

    external_event_uid = build_external_event_uid(event)
    event_date = get_event_date(event)
    dayplan = get_or_create_dayplan(subscription.user, event_date)
    timeblock_data = build_time_block_data(event)

    imported_event = get_existing_imported_event(subscription, external_event_uid)

    if imported_event is None:
        create_imported_event(
            subscription,
            external_event_uid,
            dayplan,
            timeblock_data,
        )
        return "created"

    update_imported_event(imported_event, dayplan, timeblock_data)
    return "updated"


def fetch_subscription_events(subscription):
    """
    Fetch and parse external ICS events for a subscription.

    Args:
        subscription (CalendarSubscription): Subscription being synced.

    Returns:
        list[dict]: Parsed ICS events.
    """
    ics_content = fetch_ics_content(subscription.source_url)
    return parse_ics_events(ics_content)


def finalise_subscription_sync(subscription):
    """
    Update sync metadata after a successful subscription sync.

    Args:
        subscription (CalendarSubscription): Subscription being synced.

    Returns:
        None
    """
    subscription.last_synced_at = timezone.now()
    subscription.last_error = ""
    subscription.save(update_fields=["last_synced_at", "last_error", "updated_at"])


@transaction.atomic
def sync_calendar_subscription(subscription):
    """
    Fetch and sync external calendar events into StudySync time blocks.

    Args:
        subscription (CalendarSubscription): The subscription to sync.

    Returns:
        dict: A summary of created, updated, and skipped events.
    """
    events = fetch_subscription_events(subscription)
    sync_result = build_sync_result()

    for event in events:
        outcome = sync_single_event(subscription, event)
        record_sync_outcome(sync_result, outcome)

    finalise_subscription_sync(subscription)
    return sync_result
