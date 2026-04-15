from icalendar import Calendar

from scheduler.services.ics_event_component_helpers import (
    build_parsed_event,
    get_component_datetime,
    has_valid_event_range,
    is_event_component,
)


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
        if not is_event_component(component):
            continue

        start_datetime = get_component_datetime(component, "dtstart")
        end_datetime = get_component_datetime(component, "dtend")

        if not has_valid_event_range(start_datetime, end_datetime):
            continue

        parsed_events.append(
            build_parsed_event(component, start_datetime, end_datetime)
        )

    return parsed_events