from datetime import timedelta

from django.test import TestCase
from django.utils import timezone

from scheduler.services.calendar_subscription_time_block_helpers import (
    build_external_event_uid,
    build_time_block_data,
)


class CalendarSubscriptionTimeblockHelpersTest(TestCase):
    def setUp(self):
        """Create reusable event data for time block helper tests."""
        self.start_datetime = timezone.now() + timedelta(days=2)
        self.end_datetime = self.start_datetime + timedelta(hours=1)
        self.base_event = {
            "uid": "external-123",
            "summary": "SEG Lecture",
            "description": "Weekly lecture",
            "location": "Bush House",
            "start_datetime": self.start_datetime,
            "end_datetime": self.end_datetime,
        }

    def build_event(self, **overrides):
        """Return a copy of the base event with optional overrides."""
        event = self.base_event.copy()
        event.update(overrides)
        return event

    def test_build_external_event_uid_uses_uid_when_present(self):
        """It should use the provided UID when one exists."""
        event = self.build_event()

        self.assertEqual(build_external_event_uid(event), "external-123")

    def test_build_external_event_uid_builds_fallback_when_uid_missing(self):
        """It should build a fallback UID when the event UID is missing."""
        event = self.build_event(uid="")

        result = build_external_event_uid(event)

        self.assertIn("SEG Lecture", result)
        self.assertIn(self.start_datetime.isoformat(), result)
        self.assertIn(self.end_datetime.isoformat(), result)

    def test_build_time_block_data_truncates_name_and_cleans_description(self):
        """It should prepare cleaned and truncated time block data."""
        long_name = "A" * 120
        event = self.build_event(
            summary=long_name,
            description="Date: tomorrow\nReal note",
            location="Room 101",
            end_datetime=self.start_datetime + timedelta(hours=2),
        )

        data = build_time_block_data(event)

        self.assertEqual(len(data["name"]), 100)
        self.assertEqual(data["location"], "Room 101")
        self.assertEqual(data["description"], "Real note")
        self.assertEqual(data["timezone"], "Europe/London")
