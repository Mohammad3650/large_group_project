from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from scheduler.services.password_change_helpers import change_user_password


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password(request):
    """
    Change the authenticated user's password.

    Args:
        request (Request): The incoming API request containing the current
            and new password values.

    Returns:
        Response: A success message when the password is updated, or an
        error message when the current password is incorrect.
    """
    response_data, response_status = change_user_password(
        request.user,
        request.data,
    )
    return Response(response_data, status=response_status)