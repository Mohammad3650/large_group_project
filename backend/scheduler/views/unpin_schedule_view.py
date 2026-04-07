from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from ..models import TimeBlock


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def unpin_schedule(request, block_id):
    """
    Unpin a time block by clearing its pinned flag and pinned_at timestamp.

    Only the owner of the time block may unpin it.

    Args:
        request: The HTTP request object containing the authenticated user.
        block_id (int): The ID of the time block to unpin.

    Returns:
        200 OK: If the time block was successfully unpinned.
        404 Not Found: If the time block does not exist or does not belong to the user.
    """
    try:
        block = TimeBlock.objects.get(id=block_id, day__user=request.user)
        block.pinned = False
        block.pinned_at = None
        block.save()
        return Response(status=status.HTTP_200_OK)
    except TimeBlock.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
