from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from datetime import date, timedelta
from ..models import TimeBlock
from scheduler.serializer.time_block_serializer import TimeBlockSerializer


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_schedule(request):
    today = date.today()
    week_end = today + timedelta(days=7)

    time_blocks = TimeBlock.objects.filter(
        day__user=request.user,
        day__date__lte=week_end
    ).select_related("day")

    data = [
        {
            "id": block.id,
            "date": str(block.day.date),
            "start_time": str(block.start_time) if block.start_time else None,
            "end_time": str(block.end_time) if block.end_time else None,
            "block_type": block.block_type,
            "description": block.description,
            "location": block.location,
            "is_fixed": block.is_fixed,
            "duration": block.duration,
            "time_of_day_preference": block.time_of_day_preference,
        }
        for block in time_blocks
    ]

    return Response(data)
