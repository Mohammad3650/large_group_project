from django.test import TestCase
from scheduler.services.request_parser import ScheduleRequestParser, ParsedScheduleRequest
from dataclasses import FrozenInstanceError
from datetime import datetime, date, time


class TestScheduleRequestParser(TestCase):
    def setUp(self):
        self.parser = ScheduleRequestParser()

    def test_time_to_abs_min_none(self):
        self.assertIsNone(self.parser._time_to_abs_min(None))

    def test_time_to_abs_min_regular_time(self):
        t = time(2, 30)
        self.assertEqual(self.parser._time_to_abs_min(t), 150)

    def test_create_windows_normal_window(self):
        windows = [ { "start_min": time(9, 0), "end_min": time(12, 0), "daily": True } ]
        result = self.parser.create_windows(windows)
        expected = [ {"start_min": 540, "end_min": 720, "daily": True} ]
        self.assertEqual(result, expected)

    def test_create_windows_overnight_window(self):
        windows = [ { "start_min": time(22, 0), "end_min": time(2, 0), "daily": False } ]
        result = self.parser.create_windows(windows)
        expected = [ {"start_min": 0, "end_min": 120, "daily": False}, {"start_min": 1320, "end_min": 1440, "daily": False} ]
        self.assertEqual(result, expected)

    def test_parse_with_defaults(self):
        validated = {
            "week_start": date(2026, 3, 9),
            "week_end": date(2026, 3, 15),
            "days": 7,
            "windows": [ { "start_min": time(9, 0), "end_min": time(11, 0), "daily": True } ],
            "unscheduled": [ { "duration": 60, "name": "Maths Revision", "daily": False } ]
        }

        result = self.parser.parse(validated)

        self.assertEqual(result.week_start, date(2026, 3, 9))
        self.assertEqual(result.week_end, date(2026, 3, 15))
        self.assertEqual(result.days, 7)
        self.assertTrue(result.even_spread)
        self.assertTrue(result.include_scheduled)
        self.assertEqual(result.windows, [ (540, 660, True) ])
        self.assertEqual(result.unscheduled, [ (60, "Maths Revision", 1, False, "None", "", "study", "") ])

    def test_parse_with_explicit_values(self):
        validated = {
            "week_start": date(2026, 3, 9),
            "week_end": date(2026, 3, 15),
            "days": 7,
            "even_spread": False,
            "include_scheduled": False,
            "windows": [ { "start_min": time(8, 30), "end_min": time(10, 0), "daily": False } ],
            "unscheduled": [
                {
                    "duration": 90,
                    "name": "Gym",
                    "frequency": 3,
                    "daily": False,
                    "start_time_preference": "early",
                    "location": "Gym",
                    "block_type": "exercise",
                    "description": "workout"
                }
            ]
        }

        result = self.parser.parse(validated)
        self.assertFalse(result.even_spread)
        self.assertFalse(result.include_scheduled)
        self.assertEqual(result.windows, [ (510, 600, False) ])
        self.assertEqual(result.unscheduled, [ (90, "Gym", 3, False, "early", "Gym", "exercise", "workout") ])

    def test_parse_with_overnight_window(self):
        validated = {
            "week_start": date(2026, 3, 9),
            "week_end": date(2026, 3, 15),
            "days": 7,
            "windows": [ { "start_min": time(23, 0), "end_min": time(1, 30), "daily": True } ],
            "unscheduled": []
        }
        result = self.parser.parse(validated)
        self.assertEqual(result.windows, [ (0, 90, True), (1380, 1440, True) ])