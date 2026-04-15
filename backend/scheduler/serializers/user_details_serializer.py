from django.contrib.auth import get_user_model
from rest_framework import serializers

from scheduler.services.email_validation_helpers import validate_unique_email, normalise_email

User = get_user_model()


class UserDetailsSerializer(serializers.ModelSerializer):
    """
    Serializer used for retrieving and updating the authenticated user's details.
    """

    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = (
            "email",
            "username",
            "first_name",
            "last_name",
            "phone_number",
        )

    def validate_email(self, value):
        """
        Normalises the email and prevents users from changing their email
        to one that already belongs to another account.

        Args:
            value (str): The email address provided by the user.
        Returns:
            str: The normalised email address (trimmed and converted to lowercase),
                 provided it is not already associated with another user account.

        """
        normalised_email = normalise_email(value)
        return validate_unique_email(normalised_email, current_user=self.instance)
