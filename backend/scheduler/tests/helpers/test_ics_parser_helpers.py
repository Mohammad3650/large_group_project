from datetime import date, datetime
from zoneinfo import ZoneInfo

from django.test import TestCase
from icalendar import Event

from scheduler.services.ics_parser_helpers import (
    build_parsed_event,
    get_component_datetime,
    has_valid_event_range,
    is_event_component,
    normalise_ics_datetime,
    safe_text,
)


class IcsParserHelpersTest(TestCase):
    def test_normalise_ics_datetime_converts_naive_datetime_to_europe_london(self):
        """It should attach the Europe/London timezone to naive datetimes."""
        value = datetime(2026, 4, 10, 9, 0, 0)

        result = normalise_ics_datetime(value)

        self.assertEqual(result.tzinfo, ZoneInfo("Europe/London"))
        self.assertEqual(result.hour, 9)

    def test_normalise_ics_datetime_converts_aware_datetime_to_europe_london(self):
        """It should convert aware datetimes into Europe/London time."""
        paris = ZoneInfo("Europe/Paris")
        value = datetime(2026, 4, 10, 10, 0, 0, tzinfo=paris)

        result = normalise_ics_datetime(value)

        self.assertEqual(result.tzinfo, ZoneInfo("Europe/London"))
        self.assertEqual(result.hour, 9)

    def test_normalise_ics_datetime_returns_none_for_date_only(self):
        """It should ignore date-only values."""
        result = normalise_ics_datetime(date(2026, 4, 10))
        self.assertIsNone(result)

    def test_safe_text_returns_empty_string_for_none(self):
        """It should return an empty string for None text."""
        self.assertEqual(safe_text(None), "")

    def test_safe_text_strips_whitespace(self):
        """It should trim surrounding whitespace from text values."""
        self.assertEqual(safe_text("  Lecture  "), "Lecture")

    def test_is_event_component_returns_true_for_vevent(self):
        """It should return true for VEVENT components."""
        event = Event()
        self.assertTrue(is_event_component(event))

    def test_get_component_datetime_returns_none_when_field_missing(self):
        """It should return None when the component field is missing."""
        event = Event()
        self.assertIsNone(get_component_datetime(event, "dtstart"))

    def test_has_valid_event_range_returns_false_for_missing_start(self):
        """It should reject an event range with a missing start datetime."""
        end_datetime = datetime(2026, 4, 10, 10, 0, 0, tzinfo=ZoneInfo("Europe/London"))
        self.assertFalse(has_valid_event_range(None, end_datetime))

    def test_has_valid_event_range_returns_false_for_equal_times(self):
        """It should reject an event range whose end is not after the start."""
        start_datetime = datetime(
            2026,
            4,
            10,
            9,
            0,
            0,
            tzinfo=ZoneInfo("Europe/London"),
        )
        self.assertFalse(has_valid_event_range(start_datetime, start_datetime))

    def test_build_parsed_event_uses_default_summary_when_missing(self):
        """It should use the default summary when the summary field is empty."""
        event = Event()
        event.add("uid", "event-1")
        event.add("description", "Weekly lecture")
        event.add("location", "Bush House")

        start_datetime = datetime(
            2026,
            4,
            10,
            9,
            0,
            0,
            tzinfo=ZoneInfo("Europe/London"),
        )
        end_datetime = datetime(
            2026,
            4,
            10,
            10,
            0,
            0,
            tzinfo=ZoneInfo("Europe/London"),
        )

        parsed_event = build_parsed_event(event, start_datetime, end_datetime)

        self.assertEqual(parsed_event["summary"], "Imported Event")
        self.assertEqual(parsed_event["uid"], "event-1")
        self.assertEqual(parsed_event["location"], "Bush House")