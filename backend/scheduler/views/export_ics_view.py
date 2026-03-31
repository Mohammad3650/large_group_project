from django.http import HttpResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from ..models import TimeBlock


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


def build_ics_event_lines(block):
    """
    Build the ICS lines for a single time block.

    Args:
        block (TimeBlock): Time block to convert.

    Returns:
        list[str] | None: ICS VEVENT lines, or None if the block is untimed.
    """
    if not block.start_time or not block.end_time:
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
    Build a full ICS calendar from a queryset of time blocks.

    Args:
        time_blocks (QuerySet[TimeBlock]): Time blocks to export.

    Returns:
        list[str]: Full ICS file content split into lines.
    """
    lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//StudySync//Schedule Export//EN",
    ]

    for block in time_blocks:
        event_lines = build_ics_event_lines(block)
        if event_lines:
            lines.extend(event_lines)

    lines.append("END:VCALENDAR")
    return lines


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def export_schedule_ics(request):
    """
    Export the authenticated user's schedule as an ICS calendar file.

    Args:
        request (Request): The incoming authenticated API request.

    Returns:
        HttpResponse: Downloadable ICS calendar response.
    """
    time_blocks = (
        TimeBlock.objects
        .filter(day__user=request.user)
        .select_related("day")
        .order_by("day__date", "start_time")
    )

    lines = build_ics_calendar_lines(time_blocks)

    response = HttpResponse(
        "\r\n".join(lines),
        content_type="text/calendar",
    )
    response["Content-Disposition"] = 'attachment; filename="studysync_schedule.ics"'
    return response