from django.test import TestCase
from scheduler.services.response_builder import ScheduleResponseBuilder

class ScheduleResponseBuilderTest(TestCase):
    def setUp(self):
        self.builder = ScheduleResponseBuilder()
        self.week_start = "2026-02-23"  # Monday
    
    def test_empty_solutions_test(self):
        """Infeasible solutions return []. build should return week_start + events=[]"""
        result = self.builder.build([], week_start=self.week_start)
        self.assertEqual(result, {"week_start": self.week_start, "events": []})
    
    def test_single_solution_response(self):
        """A tuple with one solution should mape to a correct event dict"""
        result = self.builder.build([(480, 540, 60, "Gym")], week_start=self.week_start)

        self.assertEqual(result["week_start"], self.week_start)
        self.assertEqual(len(result["events"]), 1)

        ev = result["events"][0]
        # 480 min = 08:00 on day 0
        self.assertEqual(ev["date"], "2026-02-23")
        self.assertEqual(ev["start_time"], "08:00:00")
        self.assertEqual(ev["end_time"], "09:00:00")

        self.assertIn(ev["block_type"], ["exercise", "study"])  # The guesser may map gym to exercise
        self.assertEqual(ev["location"], "")
        self.assertEqual(ev["is_fixed"], False)
        
    def test_multiple_solutions_count_matches_events_length(self):
        """Count field should match len(events)"""
        solutions = [(480, 540, 60, "Gym"), (600, 690, 90, "Revision")]
        result = self.builder.build(solutions, week_start=self.week_start)
        
        self.assertEqual(result["week_start"], self.week_start)
        self.assertEqual(len(result["events"]), 2)

    def test_event_field_names_match_save_serializer(self):
        result = self.builder.build([(480, 540, 60, "Gym")], week_start=self.week_start)
        ev = result["events"][0]

        expected_keys = {"date", "start_time", "end_time", "block_type", "location", "is_fixed"}
        self.assertSetEqual(set(ev.keys()), expected_keys)
