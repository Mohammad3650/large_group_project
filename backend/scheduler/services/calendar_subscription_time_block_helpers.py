from scheduler.services.calendar_subscription_event_text_helpers import (
    classify_block_type,
    clean_event_description,
    get_event_summary,
)
from scheduler.services.calendar_subscription_event_time_helpers import (
    LOCAL_TIMEZONE,
    to_naive_local_time,
)

LECTURE_NAME_LIMIT = 100


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


def build_time_block_data(event):
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
