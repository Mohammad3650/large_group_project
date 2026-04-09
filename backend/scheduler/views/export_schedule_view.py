from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from scheduler.services.export_csv_helpers import build_csv_content
from scheduler.services.export_query_helpers import get_user_time_blocks_for_export
from scheduler.services.export_response_helpers import build_csv_download_response


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
    csv_content = build_csv_content(time_blocks)
    return build_csv_download_response(csv_content)