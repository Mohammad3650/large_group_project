from django.test import TestCase
from scheduler.services.response_builder import ScheduleResponseBuilder

class ScheduleResponseBuilderTest(TestCase):
    def setUp(self):
        self.builder = ScheduleResponseBuilder()
    
    def test_empty_solutions_test(self):
        """Infeasible solutions return []. build should return count=0"""
        result = self.builder.build([])
        self.assertEqual(result, {"count": 0, "events": []})
    
    def test_single_solution_response(self):
        """A tuple with one solution should mape to a correct event dict"""
        result = self.builder.build([(480, 540, 60, "Gym")])
        self.assertEqual(result['count'], 1)
        self.assertEqual(result['events'][0], {
            "name": "Gym",
            "start_min": 480,
            "end_min": 540,
            "duration_mins": 60
            })
        
    def test_multiple_solutions_count_matches_events_length(self):
        """Count field should match len(events)"""
        solutions = [(480, 540, 60, "Gym"), (600, 690, 90, "Revision")]
        result = self.builder.build(solutions)
        self.assertEqual(result["count"], 2)
        self.assertEqual(len(result["events"]), 2)

    def test_event_field_names_are_correct(self):
        """Each event dict must contain exactly: name, start_min, end_min, duration_mins."""
        result = self.builder.build([(480, 540, 60, "Gym")])
        self.assertSetEqual(set(result["events"][0].keys()), {"name", "start_min", "end_min", "duration_mins"})

    def test_tuple_unpacking_order(self):
        """Tuples are ordered (start, end, duration, name) - verify the builder maps them correctly."""
        result = self.builder.build([(100, 200, 60, "Session")])
        event = result["events"][0]
        self.assertEqual(event["start_min"], 100)
        self.assertEqual(event["end_min"], 200)
        self.assertEqual(event["duration_mins"], 60)
        self.assertEqual(event["name"], "Session")
