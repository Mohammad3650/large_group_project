from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.exceptions import ValidationError

from scheduler.serializers.user_details_serializer import UserDetailsSerializer

User = get_user_model()


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
