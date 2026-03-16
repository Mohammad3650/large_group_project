from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, serializers

from ..models import DayPlan, TimeBlock
from scheduler.serializer.time_block_serializer import TimeBlockSerializer


def validate_timeblock_payload(request):
    # Pass data without 'date' to the serializer(as that is the timeblock data)

    block_data = {k: v for k, v in request.data.items() if k != "date"}

    serializer = TimeBlockSerializer(data=block_data)
    serializer.is_valid(raise_exception=True)
    return serializer.validated_data


def validate_date(request):
    date = request.data.get("date")

    if not date:
        raise serializers.ValidationError({"date": ["Date must be provided."]})

    return date


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
    )


def timeblock_response_payload(dayplan, time_block):
    """
    Generate a standardized response payload for a TimeBlock.

    Args:
        dayplan (DayPlan): The parent DayPlan of the time block.
        time_block (TimeBlock): The TimeBlock instance to serialize.

    Returns:
        dict: Serialized time block data including its ID and associated date.
    """
    return {
        "id": time_block.id,
        "date": str(dayplan.date),
        "name": time_block.name,
        "start_time": str(time_block.start_time) if time_block.start_time else None,
        "end_time": str(time_block.end_time) if time_block.end_time else None,
        "location": time_block.location,
        "block_type": time_block.block_type,
        "description": time_block.description,
    }


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_schedule(request):
    """
    Create a new schedule entry (TimeBlock) for the authenticated user.

    This endpoint validates the request payload, ensures a DayPlan exists for the given date,
    creates a TimeBlock, and returns a standardized response payload.

    Args:
        request (Request): DRF Request object containing the schedule payload.

    Returns:
        Response: DRF Response containing:
            - status 201 CREATED
            - JSON payload of the newly created time block (via timeblock_response_payload)

    Raises:
        serializers.ValidationError: If the payload is invalid or missing required fields.
    """
    date = validate_date(request)

    data = validate_timeblock_payload(request)
    dayplan = get_or_create_dayplan(request.user, date)
    time_block = create_timeblock(dayplan, data)

    return Response(
        timeblock_response_payload(dayplan, time_block),
        status=status.HTTP_201_CREATED,
    )
