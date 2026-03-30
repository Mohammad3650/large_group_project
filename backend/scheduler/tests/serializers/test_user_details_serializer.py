from django.contrib.auth import get_user_model
from django.test import TestCase
from scheduler.serializers.user_details_serializer import UserDetailsSerializer

User = get_user_model()


class UserDetailsSerializerTest(TestCase):
    def setUp(self):
        """Creates two users and a base data template used across tests."""
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

        self.data = {
            "email": "user1@example.com",
            "username": "user1",
            "first_name": "User",
            "last_name": "One",
            "phone_number": "07123456789",
        }

    def test_validate_email_allows_same_user_email_in_different_case(self):
        """
        Ensures a user can update their own email even if:
        - it has different casing
        - it contains extra whitespace

        Also verifies that the email is normalised (lowercased + stripped)
        """
        data = self.data.copy()
        data["email"] = " USER1@EXAMPLE.COM "

        serializer = UserDetailsSerializer(instance=self.user, data=data)

        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertEqual(serializer.validated_data["email"], "user1@example.com")

    def test_validate_email_rejects_email_used_by_another_user(self):
        """
        Ensures validation fails when trying to use an email
        that already belongs to a different user.

        Confirms:
        - serializer is invalid
        - error is attached to 'email' field
        - correct error message is returned
        """
        data = self.data.copy()
        data["email"] = "user2@example.com"

        serializer = UserDetailsSerializer(instance=self.user, data=data)

        self.assertFalse(serializer.is_valid())
        self.assertIn("email", serializer.errors)
        self.assertEqual(serializer.errors["email"][0], "Email is already in use.")
