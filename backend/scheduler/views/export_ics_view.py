from django.http import HttpResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from scheduler.services.export_schedule_helpers import (
    build_ics_content_response,
    get_user_time_blocks_for_export,
)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def export_schedule_ics(request):
    """
    Export the authenticated user's schedule as an ICS calendar file.

    Args:
        request (Request): The incoming authenticated API request.

    Returns:
        HttpResponse: Downloadable ICS calendar response.
    """
    time_blocks = get_user_time_blocks_for_export(request.user)
    return build_ics_content_response(time_blocks)