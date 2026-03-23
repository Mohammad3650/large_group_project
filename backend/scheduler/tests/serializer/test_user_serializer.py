from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.exceptions import ValidationError

from scheduler.serializer.users_serializer import (
    UserDetailsSerializer,
    UserRegistrationSerializer,
)

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


class UserDetailsSerializerTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="user1@example.com",
            username="user1",
            first_name="User",
            last_name="One",
            phone_number="07123456789",
            password="Password123!",
        )
        self.other_user = User.objects.create_user(
            email="user2@example.com",
            username="user2",
            first_name="User",
            last_name="Two",
            phone_number="07123456780",
            password="Password123!",
        )

    def test_validate_email_allows_same_user_email_in_different_case(self):
        serializer = UserDetailsSerializer(
            instance=self.user,
            data={
                "email": " USER1@EXAMPLE.COM ",
                "username": "user1",
                "first_name": "User",
                "last_name": "One",
                "phone_number": "07123456789",
            },
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertEqual(serializer.validated_data["email"], "user1@example.com")

    def test_validate_email_rejects_email_used_by_another_user(self):
        serializer = UserDetailsSerializer(
            instance=self.user,
            data={
                "email": "user2@example.com",
                "username": "user1",
                "first_name": "User",
                "last_name": "One",
                "phone_number": "07123456789",
            },
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("email", serializer.errors)
        self.assertEqual(serializer.errors["email"][0], "Email is already in use.")