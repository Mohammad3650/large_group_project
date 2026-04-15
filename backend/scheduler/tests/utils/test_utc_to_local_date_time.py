from datetime import date, time

from django.test import TestCase

from scheduler.utils.utc_to_local_date_time import utc_to_local_date_time


class UtcToLocalDateTimeTest(TestCase):

    def test_utc_time_in_bst_is_offset_by_one_hour(self):
        """It should convert UTC time to BST (UTC+1) correctly."""
        result = utc_to_local_date_time(date(2026, 4, 10), time(9, 0), "Europe/London")
        self.assertEqual(result.hour, 10)
        self.assertEqual(result.minute, 0)

    def test_utc_time_in_winter_london_is_unchanged(self):
        """It should return the same time for London in winter (UTC+0)."""
        result = utc_to_local_date_time(date(2026, 1, 15), time(9, 0), "Europe/London")
        self.assertEqual(result.hour, 9)
        self.assertEqual(result.minute, 0)

    def test_utc_time_in_tokyo_is_offset_by_nine_hours(self):
        """It should convert UTC time to Tokyo time (UTC+9) correctly."""
        result = utc_to_local_date_time(date(2026, 1, 15), time(0, 0), "Asia/Tokyo")
        self.assertEqual(result.hour, 9)
        self.assertEqual(result.minute, 0)

    def test_midnight_crossover_into_next_day(self):
        """It should handle conversion that crosses midnight into the next day."""
        result = utc_to_local_date_time(date(2026, 1, 15), time(23, 0), "Asia/Tokyo")
        self.assertEqual(result.date(), date(2026, 1, 16))
        self.assertEqual(result.hour, 8)

    def test_utc_timezone_returns_unchanged_time(self):
        """It should return the same time when timezone is UTC."""
        result = utc_to_local_date_time(date(2026, 3, 22), time(12, 0), "UTC")
        self.assertEqual(result.hour, 12)
        self.assertEqual(result.date(), date(2026, 3, 22))

    def test_none_timezone_defaults_to_utc(self):
        """It should default to UTC when timezone_str is None."""
        result = utc_to_local_date_time(date(2026, 3, 22), time(12, 0), None)
        self.assertEqual(result.hour, 12)

    def test_invalid_timezone_raises_error(self):
        """It should raise an error for an unrecognised timezone string."""
        with self.assertRaises(Exception):
            utc_to_local_date_time(date(2026, 1, 15), time(9, 0), "Invalid/Timezone")
