from django.contrib.auth import get_user_model
from django.test import TestCase

from scheduler.serializers.user_registration_serializer import (
    UserRegistrationSerializer,
)

User = get_user_model()


class UserRegistrationSerializerTest(TestCase):
    """Tests for the UserRegistrationSerializer"""
    def setUp(self):
        self.data = {
            "email": "test@example.com",
            "username": "testuser",
            "first_name": "Test",
            "last_name": "User",
            "phone_number": "07123456789",
            "password": "Password123!",
        }

    def test_serializer_is_valid_with_correct_data(self):
        """
        Ensures the serializer accepts valid input data.

        Uses a normalised version of the base payload and expects
        the serializer to pass validation without errors.
        """
        data = self.data.copy()
        data["email"] = "TEST@EXAMPLE.COM "

        serializer = UserRegistrationSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_email_is_normalised(self):
        """
        Ensures that email input is normalised by:
        - trimming whitespace
        - converting to lowercase
        """
        data = self.data.copy()
        data["email"] = " TEST@EXAMPLE.COM "

        serializer = UserRegistrationSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

        self.assertEqual(serializer.validated_data["email"], "test@example.com")

    def test_duplicate_email_is_rejected(self):
        """
        Ensures that the serializer rejects emails that already exist.

        Creates an existing user, then attempts to register another user
        with the same email and expects a validation error.
        """
        User.objects.create_user(
            email="test@example.com",
            username="existinguser",
            first_name="Existing",
            last_name="User",
            phone_number="07123456780",
            password="Password123!",
        )

        data = self.data.copy()
        data["username"] = "newuser"

        serializer = UserRegistrationSerializer(data=data)

        self.assertFalse(serializer.is_valid())
        self.assertIn("email", serializer.errors)
        self.assertEqual(serializer.errors["email"][0], "Email is already in use.")

    def test_create_hashes_password(self):
        """
        Ensures that when a user is created:
        - the password is hashed (not stored in plain text)
        - the hashed password still validates correctly using check_password
        """
        data = self.data.copy()

        serializer = UserRegistrationSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

        user = serializer.save()

        self.assertNotEqual(user.password, "Password123!")
        self.assertTrue(user.check_password("Password123!"))
