from django.test import TestCase
from rest_framework import serializers

from scheduler.models.User import User
from scheduler.services.email_validation_helpers import normalise_email, validate_unique_email


class EmailValidationHelpersTest(TestCase):
    def setUp(self):
        """Create reusable user fixtures for email validation tests."""
        self.user = User.objects.create_user(
            username="firstuser",
            email="firstuser@example.com",
            password="password123",
        )
        self.other_user = User.objects.create_user(
            username="seconduser",
            email="seconduser@example.com",
            password="password123",
        )

    def test_normalise_email_trims_whitespace_and_lowercases_email(self):
        """It should trim surrounding whitespace and convert the email to lowercase."""
        email = "  TestUser@Example.COM  "

        normalised_email = normalise_email(email)

        self.assertEqual(normalised_email, "testuser@example.com")

    def test_validate_unique_email_returns_email_when_not_already_used(self):
        """It should return the email when no user already has it."""
        email = "newuser@example.com"

        validated_email = validate_unique_email(email)

        self.assertEqual(validated_email, "newuser@example.com")

    def test_validate_unique_email_raises_error_when_email_already_exists(self):
        """It should raise a validation error when another user already uses the email."""
        with self.assertRaises(serializers.ValidationError) as context:
            validate_unique_email("firstuser@example.com")

        self.assertEqual(
            context.exception.detail[0],
            "Email is already in use.",
        )

    def test_validate_unique_email_allows_current_user_to_keep_own_email(self):
        """It should allow the current user to keep their own email address."""
        validated_email = validate_unique_email(
            "firstuser@example.com",
            current_user=self.user,
        )

        self.assertEqual(validated_email, "firstuser@example.com")

    def test_validate_unique_email_raises_error_when_updating_to_another_users_email(self):
        """It should raise a validation error when updating to another user's email."""
        with self.assertRaises(serializers.ValidationError) as context:
            validate_unique_email(
                "seconduser@example.com",
                current_user=self.user,
            )

        self.assertEqual(
            context.exception.detail[0],
            "Email is already in use.",
        )