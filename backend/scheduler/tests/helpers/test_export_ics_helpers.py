from datetime import date, time

from django.test import TestCase

from scheduler.models.DayPlan import DayPlan
from scheduler.models.TimeBlock import TimeBlock
from scheduler.models.User import User
from scheduler.services.export_ics_helpers import (
    build_ics_calendar_lines,
    build_ics_content,
    build_ics_event_lines,
    escape_ics_text,
    format_ics_datetime,
    has_timed_event_data,
)


class ExportIcsHelpersTest(TestCase):
    def setUp(self):
        """Create reusable ICS export fixtures."""
        self.user = User.objects.create_user(
            username="exporticsuser",
            email="exporticsuser@example.com",
            password="password123",
        )
        self.day_plan = DayPlan.objects.create(
            user=self.user,
            date=date(2026, 4, 10),
        )
        self.time_block = TimeBlock.objects.create(
            day=self.day_plan,
            name="SEG Lecture",
            block_type="lecture",
            start_time=time(9, 0),
            end_time=time(10, 0),
            location="Bush House",
            description="Bring laptop",
            timezone="Europe/London",
        )

    def test_format_ics_datetime_returns_ics_datetime_string(self):
        """It should format a date and time pair in ICS datetime format."""
        result = format_ics_datetime(date(2026, 4, 10), time(9, 0))
        self.assertEqual(result, "20260410T090000")

    def test_escape_ics_text_escapes_reserved_characters(self):
        """It should escape reserved ICS characters."""
        result = escape_ics_text(r"Room A, Floor 2; South Wing\North" + "\nLine 2")
        self.assertEqual(result, r"Room A\, Floor 2\; South Wing\\North\nLine 2")

    def test_has_timed_event_data_returns_true_for_timed_block(self):
        """It should return true when a block has both start and end times."""
        self.assertTrue(has_timed_event_data(self.time_block))

    def test_has_timed_event_data_returns_false_for_untimed_block(self):
        """It should return false when a block is missing start or end time."""
        untimed_block = TimeBlock.objects.create(
            day=self.day_plan,
            name="Untimed Event",
            block_type="study",
            start_time=None,
            end_time=time(10, 0),
            location="Online",
            description="No start time",
            timezone="Europe/London",
        )

        self.assertFalse(has_timed_event_data(untimed_block))

    def test_build_ics_event_lines_returns_none_for_untimed_block(self):
        """It should return none for untimed blocks."""
        untimed_block = TimeBlock.objects.create(
            day=self.day_plan,
            name="Untimed Event",
            block_type="study",
            start_time=None,
            end_time=time(10, 0),
            location="Online",
            description="No start time",
            timezone="Europe/London",
        )

        self.assertIsNone(build_ics_event_lines(untimed_block))

    def test_build_ics_event_lines_returns_expected_lines_for_timed_block(self):
        """It should return ICS VEVENT lines for a timed block."""
        event_lines = build_ics_event_lines(self.time_block)

        self.assertEqual(
            event_lines,
            [
                "BEGIN:VEVENT",
                "SUMMARY:SEG Lecture",
                "DTSTART:20260410T090000",
                "DTEND:20260410T100000",
                "LOCATION:Bush House",
                "DESCRIPTION:Bring laptop",
                "END:VEVENT",
            ],
        )

    def test_build_ics_calendar_lines_wraps_event_lines_in_calendar_lines(self):
        """It should wrap exported events in VCALENDAR lines."""
        calendar_lines = build_ics_calendar_lines([self.time_block])

        self.assertEqual(calendar_lines[0], "BEGIN:VCALENDAR")
        self.assertEqual(calendar_lines[1], "VERSION:2.0")
        self.assertEqual(calendar_lines[2], "PRODID:-//StudySync//Schedule Export//EN")
        self.assertEqual(calendar_lines[-1], "END:VCALENDAR")
        self.assertIn("BEGIN:VEVENT", calendar_lines)
        self.assertIn("SUMMARY:SEG Lecture", calendar_lines)

    def test_build_ics_content_joins_calendar_lines_with_crlf(self):
        """It should join ICS calendar lines using CRLF separators."""
        content = build_ics_content([self.time_block])

        self.assertIn("BEGIN:VCALENDAR\r\nVERSION:2.0", content)
        self.assertIn("SUMMARY:SEG Lecture", content)
        self.assertIn("END:VCALENDAR", content)

    def test_escape_ics_text_returns_empty_string_for_blank_value(self):
        """It should return an empty string for a blank value."""
        self.assertEqual(escape_ics_text(""), "")