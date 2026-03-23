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
        """
        return value.strip().lower()

    def create(self, validated_data):
        
        """
        Creates a new user using Django's built-in create_user method,
        which handles password hashing correctly.
        """
        return User.objects.create_user(**validated_data)


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
        """
        normalised_email = value.strip().lower()
        user = self.instance

        email_in_use = User.objects.exclude(pk=user.pk).filter(
            email=normalised_email
        ).exists()

        if email_in_use:
            raise serializers.ValidationError("Email is already in use.")

        return normalised_email