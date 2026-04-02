from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from ..models import TimeBlock


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def undo_complete_schedule(request, block_id):
    try:
        block = TimeBlock.objects.get(id=block_id, day__user=request.user)
        block.completed_at = None
        block.save()
        return Response(status=status.HTTP_200_OK)
    except TimeBlock.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
