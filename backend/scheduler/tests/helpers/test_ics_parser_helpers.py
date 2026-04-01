from datetime import date, datetime
from zoneinfo import ZoneInfo

from django.test import TestCase

from scheduler.services.ics_parser import _normalise_datetime, _safe_text


class IcsParserHelpersTest(TestCase):
    def test_normalise_datetime_converts_naive_datetime_to_europe_london(self):
        """It should attach the Europe/London timezone to naive datetimes."""
        value = datetime(2026, 4, 10, 9, 0, 0)

        result = _normalise_datetime(value)

        self.assertEqual(result.tzinfo, ZoneInfo("Europe/London"))
        self.assertEqual(result.hour, 9)

    def test_normalise_datetime_converts_aware_datetime_to_europe_london(self):
        """It should convert aware datetimes into Europe/London time."""
        paris = ZoneInfo("Europe/Paris")
        value = datetime(2026, 4, 10, 10, 0, 0, tzinfo=paris)

        result = _normalise_datetime(value)

        self.assertEqual(result.tzinfo, ZoneInfo("Europe/London"))
        self.assertEqual(result.hour, 9)

    def test_normalise_datetime_returns_none_for_date_only(self):
        """It should ignore date-only values."""
        result = _normalise_datetime(date(2026, 4, 10))
        self.assertIsNone(result)

    def test_safe_text_returns_empty_string_for_none(self):
        """It should return an empty string for None text."""
        self.assertEqual(_safe_text(None), "")

    def test_safe_text_strips_whitespace(self):
        """It should trim surrounding whitespace from text values."""
        self.assertEqual(_safe_text("  Lecture  "), "Lecture")