from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from scheduler.services.export_ics_helpers import build_ics_content
from scheduler.services.export_query_helpers import get_user_time_blocks_for_export
from scheduler.services.export_response_helpers import build_ics_download_response


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
    ics_content = build_ics_content(time_blocks)
    return build_ics_download_response(ics_content)