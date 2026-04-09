from datetime import date, time
from unittest.mock import patch

from django.test import TestCase
from rest_framework import serializers

from scheduler.models.CalendarSubscription import CalendarSubscription
from scheduler.models.DayPlan import DayPlan
from scheduler.models.ImportedCalendarEvent import ImportedCalendarEvent
from scheduler.models.TimeBlock import TimeBlock
from scheduler.models.User import User
from scheduler.services.calendar_subscription_view_helpers import (
    build_message_response,
    build_subscription_response_data,
    create_and_sync_subscription,
    delete_subscription_with_imports,
    get_imported_time_block_ids,
    get_user_subscriptions,
    subscription_exists,
    validate_unique_subscription,
)


class CalendarSubscriptionViewHelpersTest(TestCase):
    def setUp(self):
        """Create reusable users, subscriptions, and time block fixtures."""
        self.user = User.objects.create_user(
            username="subscriptionuser",
            email="subscriptionuser@example.com",
            password="password123",
        )
        self.other_user = User.objects.create_user(
            username="otheruser",
            email="otheruser@example.com",
            password="password123",
        )

        self.subscription = CalendarSubscription.objects.create(
            user=self.user,
            name="Main Calendar",
            source_url="https://example.com/main.ics",
        )

    def create_day_plan(self, user):
        """Create a day plan for a given user."""
        return DayPlan.objects.create(user=user, date=date(2026, 4, 10))

    def create_time_block(self, day_plan, name):
        """Create a linked time block."""
        return TimeBlock.objects.create(
            day=day_plan,
            name=name,
            block_type="lecture",
            start_time=time(9, 0),
            end_time=time(10, 0),
            location="Room A",
            description="Imported event",
            timezone="Europe/London",
        )

    def test_get_user_subscriptions_returns_only_users_subscriptions(self):
        """It should return subscriptions belonging only to the given user."""
        second_subscription = CalendarSubscription.objects.create(
            user=self.user,
            name="Second Calendar",
            source_url="https://example.com/second.ics",
        )
        CalendarSubscription.objects.create(
            user=self.other_user,
            name="Other Calendar",
            source_url="https://example.com/other.ics",
        )

        subscriptions = list(get_user_subscriptions(self.user))

        self.assertEqual(len(subscriptions), 2)
        self.assertIn(self.subscription, subscriptions)
        self.assertIn(second_subscription, subscriptions)

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

    @patch(
        "scheduler.services.calendar_subscription_view_helpers.sync_calendar_subscription"
    )
    def test_create_and_sync_subscription_creates_subscription_and_returns_sync_result(
        self,
        mock_sync_calendar_subscription,
    ):
        """It should create a subscription and return the sync result."""
        mock_sync_calendar_subscription.return_value = {
            "created": 2,
            "updated": 0,
            "skipped": 1,
        }

        subscription, sync_result = create_and_sync_subscription(
            self.user,
            {
                "name": "New Calendar",
                "source_url": "https://example.com/new.ics",
            },
        )

        self.assertEqual(subscription.user, self.user)
        self.assertEqual(subscription.name, "New Calendar")
        self.assertEqual(subscription.source_url, "https://example.com/new.ics")
        self.assertEqual(sync_result["created"], 2)
        mock_sync_calendar_subscription.assert_called_once_with(subscription)

    def test_get_imported_time_block_ids_returns_linked_ids(self):
        """It should return the linked time block IDs for a subscription."""
        day_plan = self.create_day_plan(self.user)
        time_block = self.create_time_block(day_plan, "Imported Block")

        ImportedCalendarEvent.objects.create(
            subscription=self.subscription,
            external_event_uid="event-1",
            time_block=time_block,
        )

        time_block_ids = get_imported_time_block_ids(self.subscription)

        self.assertEqual(time_block_ids, [time_block.id])

    def test_delete_subscription_with_imports_deletes_owned_imports_and_time_blocks(self):
        """It should delete linked imported events and owned time blocks."""
        day_plan = self.create_day_plan(self.user)
        time_block = self.create_time_block(day_plan, "Imported Block")

        ImportedCalendarEvent.objects.create(
            subscription=self.subscription,
            external_event_uid="event-1",
            time_block=time_block,
        )

        delete_subscription_with_imports(self.subscription, self.user)

        self.assertFalse(
            CalendarSubscription.objects.filter(id=self.subscription.id).exists()
        )
        self.assertFalse(TimeBlock.objects.filter(id=time_block.id).exists())
        self.assertEqual(ImportedCalendarEvent.objects.count(), 0)

    def test_delete_subscription_with_imports_does_not_delete_other_users_time_blocks(self):
        """It should not delete time blocks owned by another user."""
        user_day_plan = self.create_day_plan(self.user)
        other_day_plan = self.create_day_plan(self.other_user)

        user_block = self.create_time_block(user_day_plan, "User Block")
        other_block = self.create_time_block(other_day_plan, "Other Block")

        ImportedCalendarEvent.objects.create(
            subscription=self.subscription,
            external_event_uid="user-event",
            time_block=user_block,
        )
        ImportedCalendarEvent.objects.create(
            subscription=self.subscription,
            external_event_uid="other-event",
            time_block=other_block,
        )

        delete_subscription_with_imports(self.subscription, self.user)

        self.assertFalse(TimeBlock.objects.filter(id=user_block.id).exists())
        self.assertTrue(TimeBlock.objects.filter(id=other_block.id).exists())