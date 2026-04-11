from datetime import date, time
from unittest.mock import patch

from django.test import TestCase

from scheduler.models.CalendarSubscription import CalendarSubscription
from scheduler.models.DayPlan import DayPlan
from scheduler.models.ImportedCalendarEvent import ImportedCalendarEvent
from scheduler.models.TimeBlock import TimeBlock
from scheduler.models.User import User
from scheduler.services.calendar_subscription_mutation_helpers import (
    create_and_sync_subscription,
    delete_subscription_with_imports,
    get_imported_time_block_ids,
)


class CalendarSubscriptionMutationHelpersTest(TestCase):
    def setUp(self):
        """Create reusable users, subscriptions, and time block fixtures."""
        self.user = User.objects.create_user(
            username="subscriptionmutationuser",
            email="subscriptionmutationuser@example.com",
            password="password123",
        )
        self.other_user = User.objects.create_user(
            username="subscriptionmutationother",
            email="subscriptionmutationother@example.com",
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

    @patch(
        "scheduler.services.calendar_subscription_mutation_helpers.sync_calendar_subscription"
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