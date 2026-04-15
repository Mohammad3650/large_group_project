from django.utils import timezone

from scheduler.services.constants import LOCAL_TIMEZONE


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
    return to_local_datetime(event["start_datetime"]).date()