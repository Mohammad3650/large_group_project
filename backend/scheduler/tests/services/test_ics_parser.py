from datetime import date, datetime
from zoneinfo import ZoneInfo

from django.test import TestCase

from scheduler.services.ics_parser import (
    _normalise_datetime,
    _safe_text,
    parse_ics_events,
)


class IcsParserHelpersTest(TestCase):
    def test_normalise_datetime_converts_naive_datetime_to_europe_london(self):
        value = datetime(2026, 4, 10, 9, 0, 0)

        result = _normalise_datetime(value)

        self.assertEqual(result.tzinfo, ZoneInfo("Europe/London"))
        self.assertEqual(result.hour, 9)

    def test_normalise_datetime_converts_aware_datetime_to_europe_london(self):
        paris = ZoneInfo("Europe/Paris")
        value = datetime(2026, 4, 10, 10, 0, 0, tzinfo=paris)

        result = _normalise_datetime(value)

        self.assertEqual(result.tzinfo, ZoneInfo("Europe/London"))
        self.assertEqual(result.hour, 9)

    def test_normalise_datetime_returns_none_for_date_only(self):
        result = _normalise_datetime(date(2026, 4, 10))
        self.assertIsNone(result)

    def test_safe_text_returns_empty_string_for_none(self):
        self.assertEqual(_safe_text(None), "")

    def test_safe_text_strips_whitespace(self):
        self.assertEqual(_safe_text("  Lecture  "), "Lecture")


class ParseIcsEventsTest(TestCase):
    def test_parse_ics_events_returns_timed_event(self):
        ics_content = "\r\n".join([
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//StudySync Test//EN",
            "BEGIN:VEVENT",
            "UID:test-123",
            "SUMMARY:SEG Lecture",
            "DESCRIPTION:Weekly lecture",
            "LOCATION:Bush House",
            "DTSTART:20260410T090000",
            "DTEND:20260410T100000",
            "END:VEVENT",
            "END:VCALENDAR",
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
        ics_content = "\r\n".join([
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//StudySync Test//EN",
            "BEGIN:VEVENT",
            "UID:test-456",
            "DESCRIPTION:No title here",
            "LOCATION:Waterloo",
            "DTSTART:20260410T110000",
            "DTEND:20260410T120000",
            "END:VEVENT",
            "END:VCALENDAR",
        ])

        events = parse_ics_events(ics_content)

        self.assertEqual(len(events), 1)
        self.assertEqual(events[0]["summary"], "Imported Event")

    def test_parse_ics_events_skips_event_missing_start(self):
        ics_content = "\r\n".join([
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//StudySync Test//EN",
            "BEGIN:VEVENT",
            "UID:test-789",
            "SUMMARY:Broken Event",
            "DTEND:20260410T120000",
            "END:VEVENT",
            "END:VCALENDAR",
        ])

        events = parse_ics_events(ics_content)

        self.assertEqual(events, [])

    def test_parse_ics_events_skips_event_missing_end(self):
        ics_content = "\r\n".join([
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//StudySync Test//EN",
            "BEGIN:VEVENT",
            "UID:test-790",
            "SUMMARY:Broken Event",
            "DTSTART:20260410T110000",
            "END:VEVENT",
            "END:VCALENDAR",
        ])

        events = parse_ics_events(ics_content)

        self.assertEqual(events, [])

    def test_parse_ics_events_skips_all_day_event(self):
        ics_content = "\r\n".join([
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//StudySync Test//EN",
            "BEGIN:VEVENT",
            "UID:test-allday",
            "SUMMARY:All Day Event",
            "DTSTART;VALUE=DATE:20260410",
            "DTEND;VALUE=DATE:20260411",
            "END:VEVENT",
            "END:VCALENDAR",
        ])

        events = parse_ics_events(ics_content)

        self.assertEqual(events, [])

    def test_parse_ics_events_skips_event_with_end_before_start(self):
        ics_content = "\r\n".join([
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//StudySync Test//EN",
            "BEGIN:VEVENT",
            "UID:test-invalid-order",
            "SUMMARY:Broken Event",
            "DTSTART:20260410T120000",
            "DTEND:20260410T110000",
            "END:VEVENT",
            "END:VCALENDAR",
        ])

        events = parse_ics_events(ics_content)

        self.assertEqual(events, [])

    def test_parse_ics_events_ignores_non_vevent_components(self):
        ics_content = "\r\n".join([
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//StudySync Test//EN",
            "BEGIN:VTIMEZONE",
            "TZID:Europe/London",
            "END:VTIMEZONE",
            "BEGIN:VEVENT",
            "UID:test-123",
            "SUMMARY:Real Event",
            "DTSTART:20260410T090000",
            "DTEND:20260410T100000",
            "END:VEVENT",
            "END:VCALENDAR",
        ])

        events = parse_ics_events(ics_content)

        self.assertEqual(len(events), 1)
        self.assertEqual(events[0]["summary"], "Real Event")