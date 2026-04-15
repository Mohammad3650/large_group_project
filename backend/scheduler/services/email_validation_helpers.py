from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


def normalise_email(value):
    """
    Trim surrounding whitespace and convert the email to lowercase.
    """
    return value.strip().lower()


def validate_unique_email(email, current_user=None):
    """
    Ensure the email is not already used by another account.

    Args:
        email (str): The normalised email address to check.
        current_user (User | None): The current user instance when updating details.
            This user is excluded from the uniqueness check.

    Returns:
        str: The validated email address.

    Raises:
        serializers.ValidationError: If the email is already in use.
    """
    queryset = User.objects.filter(email=email)

    if current_user is not None:
        queryset = queryset.exclude(pk=current_user.pk)

    if queryset.exists():
        raise serializers.ValidationError("Email is already in use.")

    return email