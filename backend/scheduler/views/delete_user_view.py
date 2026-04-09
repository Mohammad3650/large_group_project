from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from scheduler.services.user_account_view_helpers import delete_authenticated_user


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_user(request):
    """
    Delete the currently authenticated user's account.

    Args:
        request (Request): The incoming authenticated API request.

    Returns:
        Response: A success response confirming that the account
        has been deleted.
    """
    response_data, response_status = delete_authenticated_user(request.user)
    return Response(response_data, status=response_status)