from django.test import TestCase

from scheduler.models.CalendarSubscription import CalendarSubscription
from scheduler.models.User import User
from scheduler.services.calendar_subscription_response_helpers import (
    build_message_response,
    build_subscription_response_data,
)


class CalendarSubscriptionResponseHelpersTest(TestCase):
    def setUp(self):
        """Create reusable user and subscription fixtures for response helper tests."""
        self.user = User.objects.create_user(
            username="subscriptionresponseuser",
            email="subscriptionresponseuser@example.com",
            password="password123",
        )
        self.subscription = CalendarSubscription.objects.create(
            user=self.user,
            name="Main Calendar",
            source_url="https://example.com/main.ics",
        )

    def test_build_subscription_response_data_returns_expected_payload(self):
        """It should return the standard subscription response payload."""
        sync_result = {"created": 1, "updated": 0, "skipped": 0}

        response_data = build_subscription_response_data(
            self.subscription,
            sync_result,
            "Success",
        )

        self.assertEqual(response_data["subscription"]["id"], self.subscription.id)
        self.assertEqual(response_data["sync_result"], sync_result)
        self.assertEqual(response_data["message"], "Success")

    def test_build_message_response_returns_message_payload(self):
        """It should build a message-only response payload."""
        response_data = build_message_response("Deleted successfully.")
        self.assertEqual(response_data, {"message": "Deleted successfully."})