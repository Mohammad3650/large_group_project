from zoneinfo import ZoneInfo
from datetime import datetime


def utc_to_local_date_time(date_value, time_value, timezone_str):
    utc_dt = datetime.combine(date_value, time_value, tzinfo=ZoneInfo("UTC"))
    return utc_dt.astimezone(ZoneInfo(timezone_str or "UTC"))
