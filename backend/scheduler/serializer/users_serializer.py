from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework.validators import UniqueValidator

User = get_user_model()


class UserRegistrationSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        validators=[
            UniqueValidator(
                queryset=User.objects.all(),
                message="Email is already in use.",
            )
        ]
    )
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
        return value.strip().lower()

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class UserDetailsSerializer(serializers.ModelSerializer):
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
        normalised_email = value.strip().lower()
        user = self.instance

        email_in_use = User.objects.exclude(pk=user.pk).filter(
            email=normalised_email
        ).exists()

        if email_in_use:
            raise serializers.ValidationError("Email is already in use.")

        return normalised_email