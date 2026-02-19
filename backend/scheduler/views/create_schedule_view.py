from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from ..models import DayPlan, TimeBlock
from scheduler.serializer.time_block_serializer import TimeBlockSerializer

def validate_timeblock_payload(request):
    serializer = TimeBlockSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    return serializer.validated_data


def get_or_create_dayplan(user, date):
    dayplan, _ = DayPlan.objects.get_or_create(user=user, date=date)
    return dayplan


def create_timeblock(dayplan, data):
    return TimeBlock.objects.create(
        day=dayplan,
        start_time=data["start_time"],
        end_time=data["end_time"],
        location=data.get("location", ""),
        block_type=data["block_type"],
    )


def timeblock_response_payload(dayplan, time_block):
    return {
        "id": time_block.id,
        "date": str(dayplan.date),
        "start_time": str(time_block.start_time),
        "end_time": str(time_block.end_time),
        "location": time_block.location,
        "block_type": time_block.block_type,
    }


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_schedule(request):
    data = validate_timeblock_payload(request)

    dayplan = get_or_create_dayplan(request.user, data["date"])
    time_block = create_timeblock(dayplan, data)

    return Response(
        timeblock_response_payload(dayplan, time_block),
        status=status.HTTP_201_CREATED,
    )
