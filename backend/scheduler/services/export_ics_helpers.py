from scheduler.utils.utc_to_local_datetime import utc_to_local_date_time

ICS_CALENDAR_HEADER_LINES = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//StudySync//Schedule Export//EN",
]

ICS_CALENDAR_FOOTER_LINE = "END:VCALENDAR"


def format_ics_datetime(date_value, time_value):
    """
    Format a date and time pair into ICS datetime format.

    Args:
        date_value (date): Event date.
        time_value (time): Event time.

    Returns:
        str: Datetime in YYYYMMDDTHHMMSS ICS format.
    """
    return f"{date_value.strftime('%Y%m%d')}T{time_value.strftime('%H%M%S')}"


def escape_ics_text(value):
    """
    Escape reserved ICS characters in text values.

    Args:
        value (Any): Raw text value to escape.

    Returns:
        str: Escaped ICS-safe string.
    """
    if not value:
        return ""

    return (
        str(value)
        .replace("\\", "\\\\")
        .replace(",", r"\,")
        .replace(";", r"\;")
        .replace("\n", r"\n")
    )


def has_timed_event_data(block):
    """
    Check whether a time block has both start and end times.

    Args:
        block (TimeBlock): Time block to inspect.

    Returns:
        bool: True if the block is timed.
    """
    return bool(block.start_time and block.end_time)


def build_ics_event_lines(block):
    """
    Build the ICS lines for a single time block.

    Args:
        block (TimeBlock): Time block to convert.

    Returns:
        list[str] | None: ICS VEVENT lines, or None if the block is untimed.
    """
    if not has_timed_event_data(block):
        return None

    tz = block.timezone or "UTC"
    start_local = utc_to_local_date_time(block.day.date, block.start_time, tz)
    end_local = utc_to_local_date_time(block.day.date, block.end_time, tz)

    start_str = start_local.strftime('%Y%m%dT%H%M%S')
    end_str = end_local.strftime('%Y%m%dT%H%M%S')

    return [
        "BEGIN:VEVENT",
        f"SUMMARY:{escape_ics_text(block.name)}",
        f"DTSTART;TZID={tz}:{start_str}",
        f"DTEND;TZID={tz}:{end_str}",
        f"LOCATION:{escape_ics_text(block.location)}",
        f"DESCRIPTION:{escape_ics_text(block.description)}",
        "END:VEVENT",
    ]


def build_ics_calendar_header_lines():
    """
    Build the ICS calendar header lines.

    Returns:
        list[str]: ICS header lines.
    """
    return list(ICS_CALENDAR_HEADER_LINES)


def build_ics_calendar_footer_lines():
    """
    Build the ICS calendar footer lines.

    Returns:
        list[str]: ICS footer lines.
    """
    return [ICS_CALENDAR_FOOTER_LINE]


def build_ics_calendar_event_lines(time_blocks):
    """
    Build ICS event lines for exported time blocks.

    Args:
        time_blocks (Iterable[TimeBlock]): Time blocks to export.

    Returns:
        list[str]: Flattened VEVENT lines.
    """
    lines = []

    for block in time_blocks:
        event_lines = build_ics_event_lines(block)

        if event_lines:
            lines.extend(event_lines)

    return lines


def build_ics_calendar_lines(time_blocks):
    """
    Build a full ICS calendar from exported time blocks.

    Args:
        time_blocks (Iterable[TimeBlock]): Time blocks to export.

    Returns:
        list[str]: Full ICS file content split into lines.
    """
    return (
            build_ics_calendar_header_lines()
            + build_ics_calendar_event_lines(time_blocks)
            + build_ics_calendar_footer_lines()
    )


def build_ics_content(time_blocks):
    """
    Build ICS text content for exported time blocks.

    Args:
        time_blocks (Iterable[TimeBlock]): Time blocks to export.

    Returns:
        str: ICS content as text.
    """
    return "\r\n".join(build_ics_calendar_lines(time_blocks))
