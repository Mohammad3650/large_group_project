from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from ..services.time_block_mutation_service import mutate_time_block


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def pin_schedule(request, block_id):
    """
    Pin a time block by setting its pinned flag and pinned_at timestamp.

    Only the owner of the time block may pin it.

    Args:
        request: The HTTP request object containing the authenticated user.
        block_id (int): The ID of the time block to pin.

    Returns:
        200 OK: If the time block was successfully pinned.
        404 Not Found: If the time block does not exist or does not belong to the user.
    """
    return mutate_time_block(request.user, block_id, {
        "pinned": True,
        "pinned_at": timezone.now(),
    })
