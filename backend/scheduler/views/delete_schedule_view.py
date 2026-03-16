from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from ..models import TimeBlock


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_schedule(request, block_id):
    """
    Delete a time block for the authenticated user.

    Args:
        request: DRF Request object.
        block_id: ID of the TimeBlock to delete.

    Returns:
        204 NO CONTENT if successful.
        404 NOT FOUND if the block does not exist or does not belong to the user.
    """
    try:
        block = TimeBlock.objects.get(id=block_id, day__user=request.user)
        block.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except TimeBlock.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
