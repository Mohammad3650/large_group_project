from datetime import timedelta

from django.test import TestCase
from django.utils import timezone

from scheduler.services.calendar_subscription_sync import (
    build_external_event_uid,
    build_timeblock_data,
    classify_block_type,
    clean_event_description,
    should_import_event,
)


class CalendarSubscriptionSyncHelpersTest(TestCase):
    def setUp(self):
        """Create reusable event data for helper tests."""
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

    def test_classify_block_type_returns_tutorial(self):
        """It should classify tutorial events correctly."""
        self.assertEqual(classify_block_type("SEG Tutorial"), "tutorial")

    def test_classify_block_type_returns_lab(self):
        """It should classify lab events correctly."""
        self.assertEqual(classify_block_type("Physics Lab"), "lab")

    def test_classify_block_type_defaults_to_lecture(self):
        """It should default to lecture when no keyword matches."""
        self.assertEqual(classify_block_type("Regular Lecture"), "lecture")

    def test_clean_event_description_removes_repeated_metadata_lines(self):
        """It should remove duplicated metadata lines from descriptions."""
        description = (
            "Date: 2026-04-10\n"
            "Time: 09:00\n"
            "Location: Bush House\n"
            "Bring laptop\n"
            "Weekly assessed session\n"
        )

        cleaned = clean_event_description(description)

        self.assertEqual(cleaned, "Bring laptop\nWeekly assessed session")

    def test_clean_event_description_returns_empty_string_for_blank_value(self):
        """It should return an empty string for blank or None descriptions."""
        self.assertEqual(clean_event_description(""), "")
        self.assertEqual(clean_event_description(None), "")

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

    def test_build_timeblock_data_truncates_name_and_cleans_description(self):
        """It should prepare cleaned and truncated time block data."""
        long_name = "A" * 120
        event = self.build_event(
            summary=long_name,
            description="Date: tomorrow\nReal note",
            location="Room 101",
            end_datetime=self.start_datetime + timedelta(hours=2),
        )

        data = build_timeblock_data(event)

        self.assertEqual(len(data["name"]), 100)
        self.assertEqual(data["location"], "Room 101")
        self.assertEqual(data["description"], "Real note")
        self.assertEqual(data["timezone"], "Europe/London")

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