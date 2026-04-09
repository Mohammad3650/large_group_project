from datetime import timedelta

from django.test import TestCase
from django.utils import timezone

from scheduler.services.calendar_subscription_event_time_helpers import (
    get_event_date,
    should_import_event,
)


class CalendarSubscriptionEventTimeHelpersTest(TestCase):
    def setUp(self):
        """Create reusable event datetime fixtures."""
        self.start_datetime = timezone.now() + timedelta(days=2)
        self.end_datetime = self.start_datetime + timedelta(hours=1)
        self.base_event = {
            "start_datetime": self.start_datetime,
            "end_datetime": self.end_datetime,
        }

    def build_event(self, **overrides):
        """Return a copy of the base event with optional overrides."""
        event = self.base_event.copy()
        event.update(overrides)
        return event

    def test_get_event_date_returns_local_start_date(self):
        """It should return the local event date from the start datetime."""
        event = self.build_event()
        self.assertEqual(get_event_date(event), self.start_datetime.date())

    def test_should_import_event_returns_false_for_past_event(self):
        """It should skip events that have already finished."""
        event = self.build_event(
            end_datetime=timezone.now() - timedelta(minutes=1),
        )

        self.assertFalse(should_import_event(event))

    def test_should_import_event_returns_true_for_future_event(self):
        """It should import events that end in the future."""
        event = self.build_event(
            end_datetime=timezone.now() + timedelta(minutes=1),
        )

        self.assertTrue(should_import_event(event))