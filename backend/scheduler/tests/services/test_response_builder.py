from django.test import TestCase
from scheduler.services.response_builder import ScheduleResponseBuilder
from datetime import datetime, date, time

class ScheduleResponseBuilderTest(TestCase):

    def setUp(self):
        self.builder = ScheduleResponseBuilder()

    def test_abs_min_to_date_time_same_day(self):
        d, t = self.builder._abs_min_to_date_time(date(2026, 3, 9), 150)
        self.assertEqual(d, date(2026, 3, 9))
        self.assertEqual(t, time(2, 30, 0))

    def test_abs_min_to_date_time_next_day(self):
        d, t = self.builder._abs_min_to_date_time(date(2026, 3, 9), 1500)
        self.assertEqual(d, date(2026, 3, 10))
        self.assertEqual(t, time(1, 0, 0))

    def test_abs_min_to_date_time_string_week_start(self):
        d, t = self.builder._abs_min_to_date_time("2026-03-09", 540)
        self.assertEqual(d, date(2026, 3, 9))
        self.assertEqual(t, time(9, 0, 0))

    def test_guess_block_type_lecture(self):
        self.assertEqual(self.builder._guess_block_type("Math Lecture"), "lecture")

    def test_guess_block_type_lab(self):
        self.assertEqual(self.builder._guess_block_type("Chemistry Lab"), "lab")

    def test_guess_block_type_tutorial(self):
        self.assertEqual(self.builder._guess_block_type("CS Tutorial"), "tutorial")

    def test_guess_block_type_commute(self):
        self.assertEqual(self.builder._guess_block_type("Travel to campus"), "commute")

    def test_guess_block_type_work(self):
        self.assertEqual(self.builder._guess_block_type("Work shift"), "work")

    def test_guess_block_type_exercise(self):
        self.assertEqual(self.builder._guess_block_type("Gym session"), "exercise")

    def test_guess_block_type_default(self):
        self.assertEqual(self.builder._guess_block_type("Revision"), "study")

    def test_build_basic_event(self):
        solutions = [ (time(9), time(10), date(2026, 3, 9), "Maths Revision", "Library", "study", "Chapter 1") ]
        scheduled = []

        result = self.builder.build(solutions, scheduled, date(2026, 3, 9))

        expected = {
            "week_start": "2026-03-09",
            "events": [
                {
                    "date": date(2026, 3, 9),
                    "start_time": "09:00:00",
                    "end_time": "10:00:00",
                    "block_type": "study",
                    "location": "Library",
                    "name": "Maths Revision",
                    "description": "Chapter 1",
                }
            ],
            "scheduled": []
        }

        self.assertEqual(result, expected)

    def test_build_guesses_block_type_when_missing(self):
        solutions = [ (time(10), time(11), date(2026, 3, 9), "Physics Lecture", "", "", "") ]
        scheduled = []
        result = self.builder.build(solutions, scheduled, date(2026, 3, 9))
        self.assertEqual(result["events"][0]["block_type"], "lecture")
        self.assertEqual(result["events"][0]["location"], "")
        self.assertEqual(result["events"][0]["description"], "")

    def test_build_multiple_events(self):
        solutions = [
            (time(9), time(10), date(2026, 3, 9), "Maths Revision", "Library", "study", "Algebra"),
            (time(11), time(12), date(2026, 3, 9), "Gym session", "Gym", "exercise", "Leg day"),
        ]
        scheduled = [{"name": "Fixed lecture"}]
        result = self.builder.build(solutions, scheduled, date(2026, 3, 9))
        self.assertEqual(result["week_start"], "2026-03-09")
        self.assertEqual(len(result["events"]), 2)
        self.assertEqual(result["scheduled"], scheduled)
        self.assertEqual(result["events"][0]["date"], date(2026, 3, 9))
        self.assertEqual(result["events"][1]["start_time"], "11:00:00")
