from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from ..models import TimeBlock


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def undo_complete_schedule(request, block_id):
    """
    Undo the completion of a time block by clearing its completed_at timestamp.

    Only the owner of the time block may undo its completion.

    Args:
        request: The HTTP request object containing the authenticated user.
        block_id (int): The ID of the time block to mark as incomplete.

    Returns:
        200 OK: If the time block was successfully marked as incomplete.
        404 Not Found: If the time block does not exist or does not belong to the user.
    """
    try:
        block = TimeBlock.objects.get(id=block_id, day__user=request.user)
        block.completed_at = None
        block.save()
        return Response(status=status.HTTP_200_OK)
    except TimeBlock.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
