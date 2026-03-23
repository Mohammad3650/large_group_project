from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework.validators import UniqueValidator

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
        normalised_email = value.strip().lower()
        user = self.instance

        email_in_use = (
            User.objects.exclude(pk=user.pk).filter(email=normalised_email).exists()
        )

        if email_in_use:
            raise serializers.ValidationError("Email is already in use.")

        return normalised_email
