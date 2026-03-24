from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.exceptions import ValidationError

from scheduler.serializer.user_registration_serializer import UserRegistrationSerializer

User = get_user_model()


class UserRegistrationSerializerTestCase(TestCase):
    def test_serializer_is_valid_with_correct_data(self):
        data = {
            "email": "TEST@EXAMPLE.COM ",
            "username": "testuser",
            "first_name": "Test",
            "last_name": "User",
            "phone_number": "07123456789",
            "password": "Password123!",
        }

        serializer = UserRegistrationSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_email_is_normalised(self):
        data = {
            "email": " TEST@EXAMPLE.COM ",
            "username": "testuser",
            "first_name": "Test",
            "last_name": "User",
            "phone_number": "07123456789",
            "password": "Password123!",
        }

        serializer = UserRegistrationSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

        self.assertEqual(serializer.validated_data["email"], "test@example.com")

    def test_duplicate_email_is_rejected(self):
        User.objects.create_user(
            email="test@example.com",
            username="existinguser",
            first_name="Existing",
            last_name="User",
            phone_number="07123456780",
            password="Password123!",
        )

        data = {
            "email": "test@example.com",
            "username": "newuser",
            "first_name": "New",
            "last_name": "User",
            "phone_number": "07123456789",
            "password": "Password123!",
        }

        serializer = UserRegistrationSerializer(data=data)

        self.assertFalse(serializer.is_valid())
        self.assertIn("email", serializer.errors)
        self.assertEqual(serializer.errors["email"][0], "Email is already in use.")

    def test_create_hashes_password(self):
        data = {
            "email": "test@example.com",
            "username": "testuser",
            "first_name": "Test",
            "last_name": "User",
            "phone_number": "07123456789",
            "password": "Password123!",
        }

        serializer = UserRegistrationSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

        user = serializer.save()

        self.assertNotEqual(user.password, "Password123!")
        self.assertTrue(user.check_password("Password123!"))
