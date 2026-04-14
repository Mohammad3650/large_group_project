from datetime import date, datetime
from zoneinfo import ZoneInfo

from django.test import TestCase

from scheduler.services.ics_datetime_helpers import normalise_ics_datetime


class IcsDatetimeHelpersTest(TestCase):
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

    def test_normalise_ics_datetime_returns_none_for_unsupported_type(self):
        """It should return None for unsupported value types."""
        result = normalise_ics_datetime("not a date")
        self.assertIsNone(result)