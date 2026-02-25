from django.test import TestCase
from scheduler.api.serializers import GenerateScheduleRequestSerializer


class GenerateScheduleRequestSerializerTests(TestCase):
    def test_valid_payload_is_valid(self):
        payload = {
            "days": 7,
            "windows": [{"start_min": 540, "end_min": 1020}],
            "scheduled": [{"start_min": 600, "end_min": 660, "name": "Lecture"}],
            "unscheduled": [{"duration_mins": 60, "name": "Revision"}],
            "preference": "early",
        }
        s = GenerateScheduleRequestSerializer(data=payload)
        self.assertTrue(s.is_valid(), s.errors)

    def test_missing_windows_fails(self):
        payload = {"days": 7}
        s = GenerateScheduleRequestSerializer(data=payload)
        self.assertFalse(s.is_valid())
        self.assertIn("windows", s.errors)

    def test_window_end_before_start_fails(self):
        payload = {
            "days": 7,
            "windows": [{"start_min": 1000, "end_min": 900}],
            "unscheduled": [{"duration_mins": 60, "name": "Gym"}],
        }
        s = GenerateScheduleRequestSerializer(data=payload)
        self.assertFalse(s.is_valid())
        # nested error: windows[0]
        self.assertIn("windows", s.errors)

    def test_preference_must_be_early_or_late(self):
        payload = {
            "days": 7,
            "windows": [{"start_min": 540, "end_min": 1020}],
            "preference": "balanced",  # invalid (choices are only early/late)
        }
        s = GenerateScheduleRequestSerializer(data=payload)
        self.assertFalse(s.is_valid())
        self.assertIn("preference", s.errors)

    def test_unscheduled_defaults_to_empty_list(self):
        payload = {"days": 7, "windows": [{"start_min": 540, "end_min": 1020}]}
        s = GenerateScheduleRequestSerializer(data=payload)
        self.assertTrue(s.is_valid(), s.errors)
        self.assertEqual(s.validated_data["unscheduled"], [])
        self.assertEqual(s.validated_data["scheduled"], [])
        self.assertEqual(s.validated_data["preference"], "early")