from django.test import TestCase
from datetime import time, date
from scheduler.utils.to_utc import to_utc


class ToUtcTest(TestCase):

    def test_london_time_no_offset(self):
        """
        Tests that a London time in winter (UTC+0) is unchanged when converted to UTC.
        """
        utc_time, utc_date = to_utc("09:00:00", "2026-01-15", "Europe/London")
        self.assertEqual(utc_time, time(9, 0))
        self.assertEqual(utc_date, date(2026, 1, 15))

    def test_london_bst_offset(self):
        """
        Tests that a London time in summer (UTC+1) is converted correctly to UTC.
        """
        utc_time, utc_date = to_utc("09:00:00", "2026-07-15", "Europe/London")
        self.assertEqual(utc_time, time(8, 0))
        self.assertEqual(utc_date, date(2026, 7, 15))

    def test_new_york_time(self):
        """
        Tests that a New York time (UTC-5 in winter) is converted correctly to UTC.
        """
        utc_time, utc_date = to_utc("09:00:00", "2026-01-15", "America/New_York")
        self.assertEqual(utc_time, time(14, 0))
        self.assertEqual(utc_date, date(2026, 1, 15))

    def test_midnight_crossover(self):
        """
        Tests that a time which crosses midnight when converted to UTC returns the correct date.
        """
        utc_time, utc_date = to_utc("23:00:00", "2026-01-15", "America/New_York")
        self.assertEqual(utc_time, time(4, 0))
        self.assertEqual(utc_date, date(2026, 1, 16))

    def test_tokyo_time(self):
        """
        Tests that a Tokyo time (UTC+9) is converted correctly to UTC.
        """
        utc_time, utc_date = to_utc("09:00:00", "2026-01-15", "Asia/Tokyo")
        self.assertEqual(utc_time, time(0, 0))
        self.assertEqual(utc_date, date(2026, 1, 15))

    def test_tokyo_midnight_crossover(self):
        """
        Tests that a Tokyo time which crosses midnight backwards when converted to UTC returns the correct date.
        """
        utc_time, utc_date = to_utc("05:00:00", "2026-01-15", "Asia/Tokyo")
        self.assertEqual(utc_time, time(20, 0))
        self.assertEqual(utc_date, date(2026, 1, 14))

    def test_utc_timezone(self):
        """
        Tests that a UTC time is unchanged when converted to UTC.
        """
        utc_time, utc_date = to_utc("12:00:00", "2026-03-22", "UTC")
        self.assertEqual(utc_time, time(12, 0))
        self.assertEqual(utc_date, date(2026, 3, 22))

    def test_time_without_seconds(self):
        """
        Tests that a time string without seconds (HH:MM) is handled correctly.
        """
        utc_time, utc_date = to_utc("09:00", "2026-01-15", "Europe/London")
        self.assertEqual(utc_time, time(9, 0))
        self.assertEqual(utc_date, date(2026, 1, 15))