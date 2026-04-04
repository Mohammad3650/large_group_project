from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from ..models import TimeBlock


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def complete_schedule(request, block_id):
    """
    Mark a time block as completed by setting its completed_at timestamp.

    Only the owner of the time block may complete it.

    Args:
        request: The HTTP request object containing the authenticated user.
        block_id (int): The ID of the time block to mark as completed.

    Returns:
        200 OK: If the time block was successfully marked as completed.
        404 Not Found: If the time block does not exist or does not belong to the user.
    """
    try:
        block = TimeBlock.objects.get(id=block_id, day__user=request.user)
        block.completed_at = timezone.now()
        block.pinned = False
        block.pinned_at = None
        block.save()
        return Response(status=status.HTTP_200_OK)
    except TimeBlock.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
