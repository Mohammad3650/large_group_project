from django.test import TestCase
from rest_framework import serializers

from scheduler.models.CalendarSubscription import CalendarSubscription
from scheduler.models.User import User
from scheduler.services.calendar_subscription_validation_helpers import (
    subscription_exists,
    validate_unique_subscription,
)


class CalendarSubscriptionValidationHelpersTest(TestCase):
    def setUp(self):
        """Create reusable user and subscription fixtures for validation tests."""
        self.user = User.objects.create_user(
            username="subscriptionvalidationuser",
            email="subscriptionvalidationuser@example.com",
            password="password123",
        )
        self.other_user = User.objects.create_user(
            username="subscriptionvalidationother",
            email="subscriptionvalidationother@example.com",
            password="password123",
        )
        self.subscription = CalendarSubscription.objects.create(
            user=self.user,
            name="Main Calendar",
            source_url="https://example.com/main.ics",
        )

    def test_subscription_exists_returns_true_when_match_exists(self):
        """It should return true when the user already has the subscription URL."""
        self.assertTrue(
            subscription_exists(self.user, "https://example.com/main.ics")
        )

    def test_subscription_exists_returns_false_when_match_missing(self):
        """It should return false when the user does not have the subscription URL."""
        self.assertFalse(
            subscription_exists(self.user, "https://example.com/missing.ics")
        )

    def test_validate_unique_subscription_raises_error_for_duplicate_url(self):
        """It should raise a validation error for a duplicate subscription URL."""
        with self.assertRaises(serializers.ValidationError) as context:
            validate_unique_subscription(self.user, "https://example.com/main.ics")

        self.assertEqual(
            context.exception.detail["source_url"][0],
            "You have already added this calendar subscription.",
        )

    def test_validate_unique_subscription_allows_same_url_for_different_user(self):
        """It should allow the same source URL for a different user."""
        try:
            validate_unique_subscription(
                self.other_user,
                "https://example.com/main.ics",
            )
        except serializers.ValidationError:
            self.fail("validate_unique_subscription raised unexpectedly.")