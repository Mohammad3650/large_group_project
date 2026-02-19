from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework.validators import UniqueValidator

User = get_user_model()

class UserRegistrationSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        validators=[
            UniqueValidator(
                queryset=User.objects.all(),
                message="Email is already in use."
            )
        ]
    )
    
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ("email", "password", "username", "first_name", "last_name", "phone_number")

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("email", "username", "first_name", "last_name", "phone_number")
        read_only_fields = ("email",)  # usually you don't want email changed casually
