from datetime import date, time

from django.test import TestCase

from scheduler.models.CalendarSubscription import CalendarSubscription
from scheduler.models.DayPlan import DayPlan
from scheduler.models.ImportedCalendarEvent import ImportedCalendarEvent
from scheduler.models.TimeBlock import TimeBlock
from scheduler.models.User import User


class ImportedCalendarEventModelTest(TestCase):
    def setUp(self):
        """Create reusable fixtures for imported calendar event model tests."""
        self.user = User.objects.create_user(
            username="importedeventuser",
            email="importedeventuser@example.com",
            password="password123",
        )
        self.subscription = CalendarSubscription.objects.create(
            user=self.user,
            name="Main Calendar",
            source_url="https://example.com/main.ics",
        )
        self.day_plan = DayPlan.objects.create(
            user=self.user,
            date=date(2026, 4, 10),
        )
        self.time_block = TimeBlock.objects.create(
            day=self.day_plan,
            name="Imported Block",
            block_type="lecture",
            start_time=time(9, 0),
            end_time=time(10, 0),
            location="Room A",
            description="Imported event",
            timezone="Europe/London",
        )
        self.imported_event = ImportedCalendarEvent.objects.create(
            subscription=self.subscription,
            external_event_uid="event-123",
            time_block=self.time_block,
        )

    def test_str_returns_subscription_id_and_external_event_uid(self):
        """It should return the subscription id and external event uid."""
        self.assertEqual(
            str(self.imported_event),
            f"{self.subscription.id} - event-123",
        )