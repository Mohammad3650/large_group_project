from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


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
    user = request.user

    current_password = request.data.get("current_password")
    new_password = request.data.get("new_password")

    if not user.check_password(current_password):
        return Response(
            {"error": "Current password is incorrect"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user.set_password(new_password)
    user.save()

    return Response(
        {"message": "Password updated successfully"},
        status=status.HTTP_200_OK,
    )