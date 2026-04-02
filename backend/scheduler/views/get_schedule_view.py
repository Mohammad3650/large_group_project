from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
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
    one_week_ago = timezone.now() - timedelta(days=7)
    TimeBlock.objects.filter(
        day__user=request.user,
        completed_at__isnull=False,
        completed_at__lt=one_week_ago
    ).delete()

    time_blocks = TimeBlock.objects.filter(day__user=request.user).select_related("day")
    serializer = TimeBlockSerializer(time_blocks, many=True)
    return Response(serializer.data)
