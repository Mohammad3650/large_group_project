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
LECTURE_NAME_LIMIT = 20
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


def clean_event_description(description):
    """
    Remove repeated metadata lines from imported calendar descriptions.

    Args:
        description (str): Raw imported description.

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


@transaction.atomic
def sync_calendar_subscription(subscription):
    """
    Fetch and sync external calendar events into StudySync TimeBlocks.

    Args:
        subscription (CalendarSubscription): The subscription to sync.

    Returns:
        dict: A summary of created, updated, and skipped events.
    """
    ics_content = fetch_ics_content(subscription.source_url)
    events = parse_ics_events(ics_content)

    created_count = 0
    updated_count = 0
    skipped_count = 0

    for event in events:
        if not should_import_event(event):
            skipped_count += 1
            continue

        external_event_uid = build_external_event_uid(event)

        local_start = event["start_datetime"].astimezone(LOCAL_TIMEZONE)
        event_date = local_start.date()

        dayplan = get_or_create_dayplan(subscription.user, event_date)
        timeblock_data = build_timeblock_data(event)

        imported_event = ImportedCalendarEvent.objects.filter(
            subscription=subscription,
            external_event_uid=external_event_uid,
        ).select_related("time_block").first()

        if imported_event is None:
            time_block = create_timeblock(dayplan, timeblock_data)
            ImportedCalendarEvent.objects.create(
                subscription=subscription,
                external_event_uid=external_event_uid,
                time_block=time_block,
            )
            created_count += 1
            continue

        update_timeblock(imported_event.time_block, dayplan, timeblock_data)
        updated_count += 1

    subscription.last_synced_at = timezone.now()
    subscription.last_error = ""
    subscription.save(update_fields=["last_synced_at", "last_error", "updated_at"])

    return {
        "created": created_count,
        "updated": updated_count,
        "skipped": skipped_count,
    }