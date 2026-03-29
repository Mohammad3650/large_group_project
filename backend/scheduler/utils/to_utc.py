from zoneinfo import ZoneInfo
from datetime import datetime


def to_utc(time_string, date_string, timezone_string):
    """
    Converts a local time string to UTC.

    Args:
        time_string (str): Local time string (e.g. "09:00:00")
        date_string (str): Date string (e.g. "2026-03-22")
        timezone_string (str): IANA timezone string (e.g. "Europe/London")

    Returns:
        tuple: (utc_time, utc_date) as time and date objects
    """
    local_datetime = datetime.fromisoformat(f"{date_string}T{time_string}").replace(
        tzinfo=ZoneInfo(timezone_string)
    )
    utc_datetime = local_datetime.astimezone(ZoneInfo("UTC"))
    return utc_datetime.time(), utc_datetime.date()
