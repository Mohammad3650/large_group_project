from zoneinfo import ZoneInfo

from django.test import TestCase

from scheduler.services.ics_parser import parse_ics_events


class ParseIcsEventsTest(TestCase):
    def setUp(self):
        """Create reusable ICS calendar scaffolding for parser tests."""
        self.base_calendar_lines = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//StudySync Test//EN",
        ]

    def build_ics_content(self, event_lines):
        """Build full ICS content from event-specific lines."""
        return "\r\n".join(
            self.base_calendar_lines + event_lines + ["END:VCALENDAR"]
        )

    def test_parse_ics_events_returns_timed_event(self):
        """It should parse a valid timed VEVENT."""
        ics_content = self.build_ics_content([
            "BEGIN:VEVENT",
            "UID:test-123",
            "SUMMARY:SEG Lecture",
            "DESCRIPTION:Weekly lecture",
            "LOCATION:Bush House",
            "DTSTART:20260410T090000",
            "DTEND:20260410T100000",
            "END:VEVENT",
        ])

        events = parse_ics_events(ics_content)

        self.assertEqual(len(events), 1)
        event = events[0]
        self.assertEqual(event["uid"], "test-123")
        self.assertEqual(event["summary"], "SEG Lecture")
        self.assertEqual(event["description"], "Weekly lecture")
        self.assertEqual(event["location"], "Bush House")
        self.assertEqual(event["start_datetime"].tzinfo, ZoneInfo("Europe/London"))
        self.assertEqual(event["end_datetime"].tzinfo, ZoneInfo("Europe/London"))

    def test_parse_ics_events_uses_default_summary_when_missing(self):
        """It should use a fallback summary when SUMMARY is missing."""
        ics_content = self.build_ics_content([
            "BEGIN:VEVENT",
            "UID:test-456",
            "DESCRIPTION:No title here",
            "LOCATION:Waterloo",
            "DTSTART:20260410T110000",
            "DTEND:20260410T120000",
            "END:VEVENT",
        ])

        events = parse_ics_events(ics_content)

        self.assertEqual(len(events), 1)
        self.assertEqual(events[0]["summary"], "Imported Event")

    def test_parse_ics_events_skips_event_missing_start(self):
        """It should skip events without a DTSTART."""
        ics_content = self.build_ics_content([
            "BEGIN:VEVENT",
            "UID:test-789",
            "SUMMARY:Broken Event",
            "DTEND:20260410T120000",
            "END:VEVENT",
        ])

        events = parse_ics_events(ics_content)

        self.assertEqual(events, [])

    def test_parse_ics_events_skips_event_missing_end(self):
        """It should skip events without a DTEND."""
        ics_content = self.build_ics_content([
            "BEGIN:VEVENT",
            "UID:test-790",
            "SUMMARY:Broken Event",
            "DTSTART:20260410T110000",
            "END:VEVENT",
        ])

        events = parse_ics_events(ics_content)

        self.assertEqual(events, [])

    def test_parse_ics_events_skips_all_day_event(self):
        """It should skip all-day events with date-only times."""
        ics_content = self.build_ics_content([
            "BEGIN:VEVENT",
            "UID:test-allday",
            "SUMMARY:All Day Event",
            "DTSTART;VALUE=DATE:20260410",
            "DTEND;VALUE=DATE:20260411",
            "END:VEVENT",
        ])

        events = parse_ics_events(ics_content)

        self.assertEqual(events, [])

    def test_parse_ics_events_skips_event_with_end_before_start(self):
        """It should skip events whose end time comes before the start time."""
        ics_content = self.build_ics_content([
            "BEGIN:VEVENT",
            "UID:test-invalid-order",
            "SUMMARY:Broken Event",
            "DTSTART:20260410T120000",
            "DTEND:20260410T110000",
            "END:VEVENT",
        ])

        events = parse_ics_events(ics_content)

        self.assertEqual(events, [])

    def test_parse_ics_events_ignores_non_vevent_components(self):
        """It should ignore non-VEVENT ICS components."""
        ics_content = self.build_ics_content([
            "BEGIN:VTIMEZONE",
            "TZID:Europe/London",
            "END:VTIMEZONE",
            "BEGIN:VEVENT",
            "UID:test-123",
            "SUMMARY:Real Event",
            "DTSTART:20260410T090000",
            "DTEND:20260410T100000",
            "END:VEVENT",
        ])

        events = parse_ics_events(ics_content)

        self.assertEqual(len(events), 1)
        self.assertEqual(events[0]["summary"], "Real Event")