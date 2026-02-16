from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from ..models import DayPlan, TimeBlock
from scheduler.serializer.time_block_serializer import TimeBlockSerializer

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_schedule(request):
    serializer = TimeBlockSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    data = serializer.validated_data

    # Create/get the DayPlan for that user + date
    dayplan, _ = DayPlan.objects.get_or_create(
        user=request.user,
        date=data["date"]
    )

    time_block = TimeBlock.objects.create(
        day=dayplan,
        start_time=data["start_time"],
        end_time=data["end_time"],
        block_type=data["block_type"],
        location=data.get("location", "")
    )

    return Response(
        {
            "id": time_block.id,
            "date": str(dayplan.date),
            "start_time": str(time_block.start_time),
            "end_time": str(time_block.end_time),
            "location": time_block.location,
            "block_type": time_block.block_type,
        },
        status=status.HTTP_201_CREATED
    )
