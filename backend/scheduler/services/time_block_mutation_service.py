from rest_framework import status
from rest_framework.response import Response
from ..models import TimeBlock


def mutate_time_block(user, block_id, mutations: dict) -> Response:
    """
    Fetch a TimeBlock owned by user, apply field mutations, and save.

    Args:
        user: The authenticated user.
        block_id: The ID of the TimeBlock to mutate.
        mutations: A dict of field names to new values, e.g. {'pinned': True, 'pinned_at': timezone.now()}

    Returns:
        200 OK on success, 404 if block not found or not owned by user.
    """
    try:
        block = TimeBlock.objects.get(id=block_id, day__user=user)
        for field, value in mutations.items():
            setattr(block, field, value)
        block.save()
        return Response(status=status.HTTP_200_OK)
    except TimeBlock.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
