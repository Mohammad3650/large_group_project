from zoneinfo import ZoneInfo
from datetime import datetime


def to_utc(time_str, date_str, timezone_str):
    """
    Converts a local time string to UTC.

    Args:
        time_str (str): Local time string (e.g. "09:00:00")
        date_str (str): Date string (e.g. "2026-03-22")
        timezone_str (str): IANA timezone string (e.g. "Europe/London")

    Returns:
        tuple: (utc_time, utc_date) as time and date objects
    """
    local_datetime = datetime.fromisoformat(f"{date_str}T{time_str}").replace(
        tzinfo=ZoneInfo(timezone_str)
    )
    utc_datetime = local_datetime.astimezone(ZoneInfo("UTC"))
    return utc_datetime.time(), utc_datetime.date()
