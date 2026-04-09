import csv
from io import StringIO

from django.http import HttpResponse

from scheduler.models import TimeBlock

CSV_FILENAME = "studysync_schedule.csv"
ICS_FILENAME = "studysync_schedule.ics"
ICS_CONTENT_TYPE = "text/calendar"
CSV_CONTENT_TYPE = "text/csv"

CSV_HEADERS = [
    "date",
    "name",
    "block_type",
    "start_time",
    "end_time",
    "location",
    "description",
]

ICS_CALENDAR_HEADER_LINES = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//StudySync//Schedule Export//EN",
]

ICS_CALENDAR_FOOTER_LINE = "END:VCALENDAR"


def get_user_time_blocks_for_export(user):
    """
    Retrieve exportable time blocks for a user.

    Args:
        user (User): Authenticated user.

    Returns:
        QuerySet[TimeBlock]: Ordered time blocks for export.
    """
    return (
        TimeBlock.objects.filter(day__user=user)
        .select_related("day")
        .order_by("day__date", "start_time")
    )


def format_optional_time(time_value):
    """
    Format an optional time value for export.

    Args:
        time_value (time | None): Time value to format.

    Returns:
        str: Formatted time string or an empty string.
    """
    return str(time_value) if time_value else ""


def build_csv_row(block):
    """
    Build a CSV row for a single time block.

    Args:
        block (TimeBlock): Time block to serialise.

    Returns:
        list: CSV row values for the time block.
    """
    return [
        block.day.date,
        block.name,
        block.block_type,
        format_optional_time(block.start_time),
        format_optional_time(block.end_time),
        block.location,
        block.description,
    ]


def build_csv_content(time_blocks):
    """
    Build CSV text content for exported time blocks.

    Args:
        time_blocks (Iterable[TimeBlock]): Time blocks to export.

    Returns:
        str: CSV content as text.
    """
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(CSV_HEADERS)

    for block in time_blocks:
        writer.writerow(build_csv_row(block))

    return output.getvalue()


def build_file_download_response(content, content_type, filename):
    """
    Build a downloadable file response.

    Args:
        content (str): File content.
        content_type (str): HTTP content type.
        filename (str): Download filename.

    Returns:
        HttpResponse: Download response.
    """
    response = HttpResponse(content, content_type=content_type)
    response["Content-Disposition"] = f'attachment; filename="{filename}"'
    return response


def build_csv_content_response(time_blocks):
    """
    Build a CSV download response for exported time blocks.

    Args:
        time_blocks (Iterable[TimeBlock]): Time blocks to export.

    Returns:
        HttpResponse: CSV download response.
    """
    csv_content = build_csv_content(time_blocks)
    return build_file_download_response(
        csv_content,
        CSV_CONTENT_TYPE,
        CSV_FILENAME,
    )


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

    start_dt = format_ics_datetime(block.day.date, block.start_time)
    end_dt = format_ics_datetime(block.day.date, block.end_time)

    return [
        "BEGIN:VEVENT",
        f"SUMMARY:{escape_ics_text(block.name)}",
        f"DTSTART:{start_dt}",
        f"DTEND:{end_dt}",
        f"LOCATION:{escape_ics_text(block.location)}",
        f"DESCRIPTION:{escape_ics_text(block.description)}",
        "END:VEVENT",
    ]


def build_ics_calendar_lines(time_blocks):
    """
    Build a full ICS calendar from exported time blocks.

    Args:
        time_blocks (Iterable[TimeBlock]): Time blocks to export.

    Returns:
        list[str]: Full ICS file content split into lines.
    """
    lines = list(ICS_CALENDAR_HEADER_LINES)

    for block in time_blocks:
        event_lines = build_ics_event_lines(block)

        if event_lines:
            lines.extend(event_lines)

    lines.append(ICS_CALENDAR_FOOTER_LINE)
    return lines


def build_ics_content(time_blocks):
    """
    Build ICS text content for exported time blocks.

    Args:
        time_blocks (Iterable[TimeBlock]): Time blocks to export.

    Returns:
        str: ICS content as text.
    """
    return "\r\n".join(build_ics_calendar_lines(time_blocks))


def build_ics_content_response(time_blocks):
    """
    Build an ICS download response for exported time blocks.

    Args:
        time_blocks (Iterable[TimeBlock]): Time blocks to export.

    Returns:
        HttpResponse: ICS download response.
    """
    ics_content = build_ics_content(time_blocks)
    return build_file_download_response(
        ics_content,
        ICS_CONTENT_TYPE,
        ICS_FILENAME,
    )