from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, serializers

from ..models import DayPlan, TimeBlock
from scheduler.serializer.time_block_serializer import TimeBlockSerializer

def validate_timeblock_payload(request):
    serializer = TimeBlockSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    return serializer.validated_data

    # for testing
    # serializer = TimeBlockSerializer(data=request.data)
    # if not serializer.is_valid():
    #     print("SERIALIZER ERRORS:", serializer.errors)
    #     raise serializers.ValidationError(serializer.errors)
    # return serializer.validated_data


def get_or_create_dayplan(user, date):
    dayplan, _ = DayPlan.objects.get_or_create(user=user, date=date)
    return dayplan


def create_timeblock(dayplan, data):
    return TimeBlock.objects.create(
        day=dayplan,
        name=data.get("name"),
        start_time=data.get(
            "start_time"
        ),  # the .get to ensure if no start time then None returned
        end_time=data.get("end_time"),
        location=data.get("location", ""),
        block_type=data["block_type"],
        description=data.get("description", ""),
        is_fixed=data.get("is_fixed", False),
        duration=data.get("duration"),
        time_of_day_preference=data.get("time_of_day_preference"),
    )


def timeblock_response_payload(dayplan, time_block):
    return {
        "id": time_block.id,
        "date": str(dayplan.date),
        "name": time_block.name,
        "start_time": str(time_block.start_time) if time_block.start_time else None,
        "end_time": str(time_block.end_time) if time_block.end_time else None,
        "location": time_block.location,
        "block_type": time_block.block_type,
        "description": time_block.description,
        "is_fixed": time_block.is_fixed,
        "duration": time_block.duration,
        "time_of_day_preference": time_block.time_of_day_preference,
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
