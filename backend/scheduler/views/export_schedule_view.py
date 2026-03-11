import csv
from django.http import HttpResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from ..models import TimeBlock


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def export_schedule_csv(request):
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
        writer.writerow([
            block.day.date,
            block.name,
            block.block_type,
            str(block.start_time) if block.start_time else "",
            str(block.end_time) if block.end_time else "",
            block.location,
            block.description,
        ])

    return response