from typing import Optional
from zoneinfo import ZoneInfo

from django.db import transaction
from django.utils import timezone

from scheduler.models import ImportedCalendarEvent
from scheduler.services.ics_fetcher import fetch_ics_content
from scheduler.services.ics_parser import parse_ics_events
from scheduler.services.timeblock_service import (
    create_timeblock,
    get_or_create_dayplan,
    update_timeblock,
)


DEFAULT_BLOCK_TYPE = "lecture"
LECTURE_NAME_LIMIT = 100
LOCAL_TIMEZONE = ZoneInfo("Europe/London")


def classify_block_type(summary):
    """
    Classify an imported event into a StudySync block type.

    Args:
        summary (str): Event title/summary.

    Returns:
        str: A valid StudySync block type.
    """
    lowered_summary = (summary or "").lower()

    if "tutorial" in lowered_summary:
        return "tutorial"
    if "lab" in lowered_summary:
        return "lab"

    return DEFAULT_BLOCK_TYPE


def clean_event_description(description: Optional[str]) -> str:
    """
    Remove repeated metadata lines from imported calendar descriptions.

    Args:
        description (str | None): Raw imported description.

    Returns:
        str: Cleaned description.
    """
    if not description:
        return ""

    ignored_prefixes = (
        "date:",
        "time:",
        "location:",
        "venue:",
        "event type:",
    )

    cleaned_lines = []

    for raw_line in description.splitlines():
        line = raw_line.strip()

        if not line:
            continue

        if any(line.lower().startswith(prefix) for prefix in ignored_prefixes):
            continue

        cleaned_lines.append(line)

    return "\n".join(cleaned_lines)


def build_external_event_uid(event):
    """
    Build a stable fallback UID when an ICS event does not provide one.

    Args:
        event (dict): Parsed event dictionary.

    Returns:
        str: A unique external event identifier.
    """
    if event["uid"]:
        return event["uid"]

    return (
        f"{event['summary']}|"
        f"{event['start_datetime'].isoformat()}|"
        f"{event['end_datetime'].isoformat()}"
    )


def build_timeblock_data(event):
    """
    Convert a parsed ICS event into TimeBlock creation data.

    Args:
        event (dict): Parsed event dictionary.

    Returns:
        dict: TimeBlock data payload.
    """
    summary = (event["summary"] or "Imported Event").strip()

    local_start = event["start_datetime"].astimezone(LOCAL_TIMEZONE)
    local_end = event["end_datetime"].astimezone(LOCAL_TIMEZONE)

    return {
        "name": summary[:LECTURE_NAME_LIMIT],
        "start_time": local_start.time().replace(tzinfo=None),
        "end_time": local_end.time().replace(tzinfo=None),
        "location": event["location"],
        "block_type": classify_block_type(summary),
        "description": clean_event_description(event["description"]),
        "timezone": LOCAL_TIMEZONE.key,
    }


def should_import_event(event):
    """
    Decide whether an event should be imported.

    Args:
        event (dict): Parsed event dictionary.

    Returns:
        bool: True if the event should be imported.
    """
    return event["end_datetime"] >= timezone.now()


def get_event_date(event):
    """
    Get the local event date in Europe/London.

    Args:
        event (dict): Parsed event dictionary.

    Returns:
        date: Local event date.
    """
    return event["start_datetime"].astimezone(LOCAL_TIMEZONE).date()


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
    event_date,
):
    """
    Create a new imported event and linked TimeBlock.

    Args:
        subscription (CalendarSubscription): Subscription being synced.
        external_event_uid (str): Stable external event identifier.
        dayplan (DayPlan): Target day plan.
        timeblock_data (dict): TimeBlock payload.
        event_date (date): Local event date.

    Returns:
        None
    """
    time_block = create_timeblock(dayplan, timeblock_data, str(event_date))
    ImportedCalendarEvent.objects.create(
        subscription=subscription,
        external_event_uid=external_event_uid,
        time_block=time_block,
    )


def update_imported_event(imported_event, dayplan, timeblock_data, event_date):
    """
    Update the linked TimeBlock for an existing imported event.

    Args:
        imported_event (ImportedCalendarEvent): Existing imported event mapping.
        dayplan (DayPlan): Target day plan.
        timeblock_data (dict): Updated TimeBlock payload.
        event_date (date): Local event date.

    Returns:
        None
    """
    update_timeblock(
        imported_event.time_block,
        dayplan,
        timeblock_data,
        str(event_date),
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
    timeblock_data = build_timeblock_data(event)

    imported_event = get_existing_imported_event(subscription, external_event_uid)

    if imported_event is None:
        create_imported_event(
            subscription,
            external_event_uid,
            dayplan,
            timeblock_data,
            event_date,
        )
        return "created"

    update_imported_event(imported_event, dayplan, timeblock_data, event_date)
    return "updated"


def build_sync_result():
    """
    Build an empty sync result dictionary.

    Returns:
        dict: Fresh sync counters for created, updated, and skipped events.
    """
    return {
        "created": 0,
        "updated": 0,
        "skipped": 0,
    }


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
        sync_result[outcome] += 1

    finalise_subscription_sync(subscription)
    return sync_result