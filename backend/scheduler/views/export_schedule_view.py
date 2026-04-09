from django.http import HttpResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from ..models import TimeBlock
from scheduler.services.export_schedule_helpers import (
    build_csv_content_response,
    get_user_time_blocks_for_export,
)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def export_schedule_csv(request):
    """
    Export the authenticated user's schedule as a CSV file.

    Args:
        request (Request): The incoming authenticated API request.

    Returns:
        HttpResponse: Downloadable CSV response.
    """
    time_blocks = get_user_time_blocks_for_export(request.user)
    return build_csv_content_response(time_blocks)