from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from ..models import TimeBlock


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_schedule(request, block_id):
    try:
        block = TimeBlock.objects.get(id=block_id, day__user=request.user)
        block.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except TimeBlock.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
