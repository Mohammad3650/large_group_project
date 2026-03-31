from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


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
    user = request.user
    user.delete()

    return Response(
        {"message": "Account deleted"},
        status=status.HTTP_200_OK,
    )