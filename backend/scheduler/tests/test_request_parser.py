from django.test import TestCase
from scheduler.services.request_parser import ScheduleRequestParser, ParsedScheduleRequest
from dataclasses import FrozenInstanceError


class TestRequestParser(TestCase):
    def setUp(self):
        self.parser = ScheduleRequestParser()
        self.json_input = {'days': 3, 'preference': 'early', 
            'windows': [
                  {'start_min': 480, 'end_min': 720}, 
                  {'start_min': 780, 'end_min': 1020}
                  ], 
            'scheduled': [
                {'name': "FC2 Lecture", 'start_min': 600, 'end_min': 660},
                {'name': "SEG Meeting", 'start_min': 840, 'end_min': 900},
                {'name': "Revision", 'start_min': 540, 'end_min': 570}
                ], 
            'unscheduled': [
                {'name': "Gym", 'duration_mins': 60}, 
                {'name': "FC2 Revision", 'duration_mins': 120},
                {'name': "Revision", 'duration_mins': 45}
                ]}

    def test_valid_request_correctly_read(self):
        result = self.parser.parse(self.json_input)
        self.assertEqual(result.days, 3)
        self.assertEqual(result.windows, [(480, 720), (780, 1020)])
        self.assertEqual(result.scheduled, [(600, 660, "FC2 Lecture"), (840, 900, "SEG Meeting"), (540, 570, "Revision")])
        self.assertCountEqual(result.unscheduled, [(120, "FC2 Revision"), (60, "Gym"), (45, "Revision")])
        self.assertEqual(result.preference, 'early')


    def test_missing_optional_lists_default_to_empty(self):
        minimal = {
            "days": 2,
            "windows": [{"start_min": 480, "end_min": 600}],
        }

        result = self.parser.parse(minimal)

        self.assertEqual(result.days, 2)
        self.assertEqual(result.windows, [(480, 600)])
        self.assertEqual(result.scheduled, [])
        self.assertEqual(result.unscheduled, [])
        self.assertEqual(result.preference, "early")
    
    def test_preference_defaults_to_early_when_missing(self):
        data = {
            "days": 1,
            "windows": [{"start_min": 480, "end_min": 540}],
            "scheduled": [],
            "unscheduled": [],
        }

        result = self.parser.parse(data)
        self.assertEqual(result.preference, "early")
    
    def test_dataclass_is_frozen(self):
        result = self.parser.parse(self.json_input)
        with self.assertRaises(FrozenInstanceError):
            result.days = 10 
