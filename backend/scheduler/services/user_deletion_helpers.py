from rest_framework import status

ACCOUNT_DELETED_MESSAGE = {
    "message": "Account deleted",
}


def delete_authenticated_user(user):
    """
    Delete the authenticated user's account.

    Args:
        user (User): Authenticated user.

    Returns:
        tuple[dict, int]: Response payload and HTTP status.
    """
    user.delete()
    return ACCOUNT_DELETED_MESSAGE, status.HTTP_200_OK