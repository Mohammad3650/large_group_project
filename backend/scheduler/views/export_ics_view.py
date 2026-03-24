from django.http import HttpResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from ..models import TimeBlock


def format_ics_datetime(date_value, time_value):
    return f"{date_value.strftime('%Y%m%d')}T{time_value.strftime('%H%M%S')}"


def escape_ics_text(value):
    if not value:
        return ""
    return (
        str(value)
        .replace("\\", "\\\\")
        .replace(",", r"\,")
        .replace(";", r"\;")
        .replace("\n", r"\n")
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def export_schedule_ics(request):
    time_blocks = (
        TimeBlock.objects
        .filter(day__user=request.user)
        .select_related("day")
        .order_by("day__date", "start_time")
    )

    lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//StudySync//Schedule Export//EN",
    ]

    for block in time_blocks:
        if not block.start_time or not block.end_time:
            continue

        start_dt = format_ics_datetime(block.day.date, block.start_time)
        end_dt = format_ics_datetime(block.day.date, block.end_time)

        lines.extend([
            "BEGIN:VEVENT",
            f"SUMMARY:{escape_ics_text(block.name)}",
            f"DTSTART:{start_dt}",
            f"DTEND:{end_dt}",
            f"LOCATION:{escape_ics_text(block.location)}",
            f"DESCRIPTION:{escape_ics_text(block.description)}",
            "END:VEVENT",
        ])

    lines.append("END:VCALENDAR")

    response = HttpResponse(
        "\r\n".join(lines),
        content_type="text/calendar",
    )
    response["Content-Disposition"] = 'attachment; filename="studysync_schedule.ics"'
    return response