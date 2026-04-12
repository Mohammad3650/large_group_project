DEFAULT_IMPORTED_EVENT_SUMMARY = "Imported Event"


def safe_text(value):
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


def is_event_component(component):
    """
    Check whether an ICS component is a VEVENT.

    Args:
        component: ICS calendar component.

    Returns:
        bool: True if the component is a VEVENT.
    """
    return component.name == "VEVENT"


def get_component_datetime(component, field_name):
    """
    Get and normalise a datetime field from an ICS component.

    Args:
        component: ICS calendar component.
        field_name (str): ICS field name such as DTSTART or DTEND.

    Returns:
        datetime | None: Normalised datetime if available and valid.
    """
    from scheduler.services.ics_datetime_helpers import normalise_ics_datetime

    field_value = component.get(field_name)

    if field_value is None:
        return None

    return normalise_ics_datetime(field_value.dt)


def has_valid_event_range(start_datetime, end_datetime):
    """
    Check whether event start and end datetimes form a valid timed range.

    Args:
        start_datetime (datetime | None): Event start datetime.
        end_datetime (datetime | None): Event end datetime.

    Returns:
        bool: True if the event range is valid.
    """
    if start_datetime is None or end_datetime is None:
        return False

    return end_datetime > start_datetime


def get_event_summary(component):
    """
    Get a cleaned event summary with a default fallback.

    Args:
        component: ICS calendar component.

    Returns:
        str: Event summary.
    """
    return safe_text(component.get("summary")) or DEFAULT_IMPORTED_EVENT_SUMMARY


def build_parsed_event(component, start_datetime, end_datetime):
    """
    Build a parsed event dictionary from an ICS component.

    Args:
        component: ICS calendar component.
        start_datetime (datetime): Normalised event start datetime.
        end_datetime (datetime): Normalised event end datetime.

    Returns:
        dict: Parsed event dictionary.
    """
    return {
        "uid": safe_text(component.get("uid")),
        "summary": get_event_summary(component),
        "description": safe_text(component.get("description")),
        "location": safe_text(component.get("location")),
        "start_datetime": start_datetime,
        "end_datetime": end_datetime,
    }