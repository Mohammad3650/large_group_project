from rest_framework import status

INCORRECT_CURRENT_PASSWORD_ERROR = {
    "error": "Current password is incorrect",
}
PASSWORD_UPDATED_MESSAGE = {
    "message": "Password updated successfully",
}


def get_password_change_data(data):
    """
    Extract password change fields from request data.

    Args:
        data (dict): Incoming request data.

    Returns:
        tuple[str | None, str | None]: Current and new password values.
    """
    return data.get("current_password"), data.get("new_password")


def has_correct_current_password(user, current_password):
    """
    Check whether the provided current password matches the user.

    Args:
        user (User): Authenticated user.
        current_password (str | None): Submitted current password.

    Returns:
        bool: True if the password matches.
    """
    return user.check_password(current_password)


def set_user_password(user, new_password):
    """
    Set and save a user's password.

    Args:
        user (User): Authenticated user.
        new_password (str | None): New password value.

    Returns:
        None
    """
    user.set_password(new_password)
    user.save()


def change_user_password(user, data):
    """
    Change a user's password when the current password is correct.

    Args:
        user (User): Authenticated user.
        data (dict): Incoming request data.

    Returns:
        tuple[dict, int]: Response payload and HTTP status.
    """
    current_password, new_password = get_password_change_data(data)

    if not has_correct_current_password(user, current_password):
        return INCORRECT_CURRENT_PASSWORD_ERROR, status.HTTP_400_BAD_REQUEST

    set_user_password(user, new_password)
    return PASSWORD_UPDATED_MESSAGE, status.HTTP_200_OK