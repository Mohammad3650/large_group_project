from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from ..models import TimeBlock
from scheduler.serializers.time_block_serializer import TimeBlockSerializer


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_schedule(request):
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
    time_blocks = TimeBlock.objects.filter(day__user=request.user).select_related("day")
    serializer = TimeBlockSerializer(time_blocks, many=True)

    return Response(serializer.data)
