from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework.validators import UniqueValidator

User = get_user_model()


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer used when registering a new user.

    Responsibilities:
    - validates incoming registration data
    - enforces unique email addresses
    - ensures the password is write-only
    - creates the user using Django's create_user method
    """

    email = serializers.EmailField(
        validators=[
            UniqueValidator(
                queryset=User.objects.all(),
                message="Email is already in use.",
            )
        ]
    )

    # Password is accepted on input
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = (
            "email",
            "password",
            "username",
            "first_name",
            "last_name",
            "phone_number",
        )

    def validate_email(self, value):
        """
        Normalises email input before saving it.

        Args:
            value (str): The email address provided by the user.

        Returns:
            str: The normalised email address in lowercase with surrounding whitespace removed.
        """
        return value.strip().lower()

    def create(self, validated_data):
        """
        Creates a new user using Django's built-in create_user method,
        which handles password hashing correctly.

        Args:
            validated_data (dict): A dictionary containing validated user registration data.

        Returns:
            User: The newly created user instance.
        """
        return User.objects.create_user(**validated_data)
