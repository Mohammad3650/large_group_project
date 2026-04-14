from django.test import TestCase

from scheduler.services.calendar_subscription_event_text_helpers import (
    classify_block_type,
    clean_event_description,
    get_event_summary,
    should_keep_description_line,
)


class CalendarSubscriptionEventTextHelpersTest(TestCase):
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

    def test_get_event_summary_returns_cleaned_summary(self):
        """It should return a stripped event summary."""
        event = {"summary": "  SEG Lecture  "}
        self.assertEqual(get_event_summary(event), "SEG Lecture")

    def test_get_event_summary_returns_default_when_missing(self):
        """It should return the default summary when the event summary is empty."""
        event = {"summary": ""}
        self.assertEqual(get_event_summary(event), "Imported Event")

    def test_should_keep_description_line_returns_false_for_blank_line(self):
        """It should return false for a blank description line."""
        self.assertFalse(should_keep_description_line(""))