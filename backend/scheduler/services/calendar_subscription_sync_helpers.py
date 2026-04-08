from typing import Optional
from zoneinfo import ZoneInfo

from django.utils import timezone

DEFAULT_BLOCK_TYPE = "lecture"
LECTURE_NAME_LIMIT = 100
LOCAL_TIMEZONE = ZoneInfo("Europe/London")

BLOCK_TYPE_KEYWORDS = (
    ("tutorial", "tutorial"),
    ("lab", "lab"),
)

DESCRIPTION_PREFIXES_TO_IGNORE = (
    "date:",
    "time:",
    "location:",
    "venue:",
    "event type:",
)


def classify_block_type(summary: Optional[str]) -> str:
    """
    Classify an imported event into a StudySync block type.

    Args:
        summary (str | None): Event title/summary.

    Returns:
        str: A valid StudySync block type.
    """
    lowered_summary = (summary or "").lower()

    for keyword, block_type in BLOCK_TYPE_KEYWORDS:
        if keyword in lowered_summary:
            return block_type

    return DEFAULT_BLOCK_TYPE


def should_keep_description_line(line: str) -> bool:
    """
    Decide whether a description line should be kept.

    Args:
        line (str): A stripped description line.

    Returns:
        bool: True if the line should be kept.
    """
    if not line:
        return False

    lowered_line = line.lower()
    return not any(
        lowered_line.startswith(prefix)
        for prefix in DESCRIPTION_PREFIXES_TO_IGNORE
    )


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

    cleaned_lines = [
        line
        for raw_line in description.splitlines()
        if should_keep_description_line(line := raw_line.strip())
    ]
    return "\n".join(cleaned_lines)


def get_event_summary(event) -> str:
    """
    Get a cleaned event summary.

    Args:
        event (dict): Parsed event dictionary.

    Returns:
        str: Cleaned summary for display/storage.
    """
    return (event["summary"] or "Imported Event").strip()


def build_external_event_uid(event) -> str:
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


def to_local_datetime(value):
    """
    Convert a datetime into the local StudySync timezone.

    Args:
        value (datetime): Datetime to convert.

    Returns:
        datetime: Datetime converted to Europe/London.
    """
    return value.astimezone(LOCAL_TIMEZONE)


def to_naive_local_time(value):
    """
    Convert a datetime into a naive local time.

    Args:
        value (datetime): Datetime to convert.

    Returns:
        time: Naive local time.
    """
    return to_local_datetime(value).time().replace(tzinfo=None)


def build_timeblock_data(event):
    """
    Convert a parsed ICS event into TimeBlock creation data.

    Args:
        event (dict): Parsed event dictionary.

    Returns:
        dict: TimeBlock data payload.
    """
    summary = get_event_summary(event)

    return {
        "name": summary[:LECTURE_NAME_LIMIT],
        "start_time": to_naive_local_time(event["start_datetime"]),
        "end_time": to_naive_local_time(event["end_datetime"]),
        "location": event["location"],
        "block_type": classify_block_type(summary),
        "description": clean_event_description(event["description"]),
        "timezone": LOCAL_TIMEZONE.key,
    }


def should_import_event(event) -> bool:
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
    return to_local_datetime(event["start_datetime"]).date()


def record_sync_outcome(sync_result, outcome):
    """
    Record a sync outcome in the result dictionary.

    Args:
        sync_result (dict): Sync counter dictionary.
        outcome (str): Outcome key to increment.

    Returns:
        None
    """
    sync_result[outcome] += 1