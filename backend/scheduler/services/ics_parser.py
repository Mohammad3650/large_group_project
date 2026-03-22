from datetime import date, datetime
from zoneinfo import ZoneInfo

from icalendar import Calendar


LOCAL_TIMEZONE = ZoneInfo("Europe/London")


def _normalise_datetime(value):
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


def _safe_text(value):
    """
    Convert an ICS field to plain text.

    Args:
        value (Any): Raw ICS value.

    Returns:
        str: A clean string value.
    """
    if value is None:
        return ""

    return str(value).strip()


def parse_ics_events(ics_content):
    """
    Parse ICS content into a list of plain event dictionaries.

    Args:
        ics_content (str): Raw ICS text.

    Returns:
        list[dict]: Parsed timed event dictionaries.
    """
    calendar = Calendar.from_ical(ics_content)
    parsed_events = []

    for component in calendar.walk():
        if component.name != "VEVENT":
            continue

        start_value = component.get("dtstart")
        end_value = component.get("dtend")

        if start_value is None or end_value is None:
            continue

        start_datetime = _normalise_datetime(start_value.dt)
        end_datetime = _normalise_datetime(end_value.dt)

        if start_datetime is None or end_datetime is None:
            continue

        if end_datetime <= start_datetime:
            continue

        parsed_events.append(
            {
                "uid": _safe_text(component.get("uid")),
                "summary": _safe_text(component.get("summary")) or "Imported Event",
                "description": _safe_text(component.get("description")),
                "location": _safe_text(component.get("location")),
                "start_datetime": start_datetime,
                "end_datetime": end_datetime,
            }
        )

    return parsed_events