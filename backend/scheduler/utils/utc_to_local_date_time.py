from zoneinfo import ZoneInfo
from datetime import datetime


def utc_to_local_date_time(date_value, time_value, timezone_str):
    """
    Convert a UTC date and time pair to a timezone-aware local datetime.

    Args:
        date_value (date): The date of the event in UTC.
        time_value (time): The time of the event in UTC.
        timezone_str (str | None): IANA timezone string (e.g. "Europe/London").
            Defaults to UTC if None or empty.

    Returns:
        datetime: A timezone-aware datetime object in the target local timezone.
    """
    utc_datetime = datetime.combine(date_value, time_value, tzinfo=ZoneInfo("UTC"))
    return utc_datetime.astimezone(ZoneInfo(timezone_str or "UTC"))
