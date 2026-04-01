import csv

from django.http import HttpResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from ..models import TimeBlock


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
        str(block.start_time) if block.start_time else "",
        str(block.end_time) if block.end_time else "",
        block.location,
        block.description,
    ]


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def export_schedule_csv(request):
    """
    Export the authenticated user's schedule as a CSV file.

    Args:
        request (Request): The incoming authenticated API request.

    Returns:
        HttpResponse: Downloadable CSV response.
    """
    time_blocks = (
        TimeBlock.objects
        .filter(day__user=request.user)
        .select_related("day")
        .order_by("day__date", "start_time")
    )

    response = HttpResponse(content_type="text/csv")
    response["Content-Disposition"] = 'attachment; filename="studysync_schedule.csv"'

    writer = csv.writer(response)
    writer.writerow([
        "date",
        "name",
        "block_type",
        "start_time",
        "end_time",
        "location",
        "description",
    ])

    for block in time_blocks:
        writer.writerow(build_csv_row(block))

    return response