from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from ..models import TimeBlock
from scheduler.serializer.time_block_serializer import TimeBlockSerializer

"""
    Retrieve all time blocks for the authenticated user.

    This endpoint fetches all TimeBlock objects associated with the user's DayPlan.
    Args:
        request (Request): DRF Request object. Must be authenticated.

    Returns:
        Response: A DRF Response containing:
            - status 200 OK
            - JSON array of serialized TimeBlock objects
"""


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_schedule(request):
    time_blocks = TimeBlock.objects.filter(day__user=request.user).select_related("day")
    serializer = TimeBlockSerializer(time_blocks, many=True)

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
    block = get_object_or_404(TimeBlock, id=id, day__user=request.user)

    if request.method == "GET":
        serializer = TimeBlockSerializer(block)
        data = serializer.data
        data["date"] = str(block.day.date)
        return Response(data)

    serializer = TimeBlockSerializer(block, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)

    return Response(serializer.errors, status=400)
