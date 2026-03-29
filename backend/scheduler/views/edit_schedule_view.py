from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from ..models import DayPlan, TimeBlock
from scheduler.serializers.time_block_serializer import TimeBlockSerializer
from ..utils.to_utc import to_utc

def get_user_timeblock(user, block_id):
    """
    Retrieve a TimeBlock belonging to the authenticated user.
    """
    return get_object_or_404(TimeBlock, id=block_id, day__user=user)


def serialize_timeblock_with_date(block):
    """
    Serialise a TimeBlock and include its associated date.
    """
    serializer = TimeBlockSerializer(block)
    data = serializer.data
    data["date"] = str(block.day.date)
    return data


def get_request_timezone_and_date(request, block):
    """
    Resolve timezone and date from the request, falling back to existing values.
    """
    timezone = request.data.get("timezone", block.timezone)
    date = request.data.get("date", str(block.day.date))
    return timezone, date


def apply_utc_time_updates(serializer, request, date, timezone):
    """
    Convert provided start/end times to UTC and inject them into validated data.
    """
    if "start_time" in request.data:
        start_time_utc, _ = to_utc(request.data["start_time"], date, timezone)
        serializer.validated_data["start_time"] = start_time_utc

    if "end_time" in request.data:
        end_time_utc, _ = to_utc(request.data["end_time"], date, timezone)
        serializer.validated_data["end_time"] = end_time_utc


def update_timeblock_day_if_needed(block, user, date):
    """
    Reassign the TimeBlock to a different DayPlan if the date has changed.
    """
    if date == str(block.day.date):
        return

    day_plan, _ = DayPlan.objects.get_or_create(user=user, date=date)
    block.day = day_plan
    block.save(update_fields=["day"])


def partially_update_timeblock(request, block):
    """
    Validate and partially update an existing TimeBlock.
    """
    serializer = TimeBlockSerializer(block, data=request.data, partial=True)

    if not serializer.is_valid():
        return Response(serializer.errors, status=400)

    timezone, date = get_request_timezone_and_date(request, block)
    apply_utc_time_updates(serializer, request, date, timezone)
    update_timeblock_day_if_needed(block, request.user, date)

    serializer.save()
    return Response(serializer.data)

@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def edit_timeblock(request, id):
    """
    Retrieve or partially update a TimeBlock belonging to the authenticated user.

    GET:
        - Fetches the time block data, including the associated date.

    PATCH:
        - Allows partial updates to one or more fields of the TimeBlock.
        - Validates fields via TimeBlockSerializer before saving.

    Args:
        request (Request): DRF Request object.
        id (int): ID of the TimeBlock to retrieve or update.

    Returns:
        Response:
            - GET: 200 OK with serialized time block data
            - PATCH: 200 OK with updated serialized data
            - 400 BAD REQUEST if validation fails
            - 404 NOT FOUND if the time block does not belong to the user or does not exist
    """
    block = get_user_timeblock(request.user, id)

    if request.method == "GET":
        return Response(serialize_timeblock_with_date(block))

    return partially_update_timeblock(request, block)
