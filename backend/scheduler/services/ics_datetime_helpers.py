from datetime import date, datetime

from scheduler.services.constants import LOCAL_TIMEZONE


def normalise_ics_datetime(value):
    """
    Convert an ICS date or datetime value into a Europe/London datetime.

    Args:
        value (date | datetime): The raw ICS date/datetime value.

    Returns:
        datetime | None: A timezone-aware local datetime, or None if the value
        is not suitable for timed events.
    """
    if isinstance(value, datetime):
        if value.tzinfo is None:
            return value.replace(tzinfo=LOCAL_TIMEZONE)

        return value.astimezone(LOCAL_TIMEZONE)

    if isinstance(value, date):
        return None

    return None