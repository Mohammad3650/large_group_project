from django.test import TestCase
from backend.scheduler.serializers.save_time_block_serializer import SaveTimeBlockSerializer, SaveWeeklyPlanSerializer
from scheduler.models.TimeBlock import TimeBlock

def valid_event(**overrides):
    base = {
        "date": "2026-03-16",
        "name": "Lecture",
        "start_time": "09:00",
        "end_time": "10:30",
        "block_type": "lecture",
        "location": "campus"
    }
    base.update(overrides)
    return base

class TestSaveTimeBlockSerializer(TestCase):
    def setUp(self):
        self.data = {
            "date": "2026-03-09",
            "name": "Gym",
            "start_time": "09:00:00",
            "end_time": "10:00:00",
            "block_type": TimeBlock.BLOCK_TYPE_CHOICES[0][0],
            "location": "Campus",
            "description": "Morning session",
        }
    
    def test_valid_data_passes(self):
        serializer = SaveTimeBlockSerializer(data=self.data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_missing_date_fails(self):
        data = self.data
        data.pop("date")

        serializer = SaveTimeBlockSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("non_field_errors", serializer.errors)
    
    def test_missing_start_time_fails(self):
        data = self.data
        data.pop("start_time")

        serializer = SaveTimeBlockSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("non_field_errors", serializer.errors)

    def test_missing_end_time_fails(self):
        data = self.data
        data.pop("end_time")

        serializer = SaveTimeBlockSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("non_field_errors", serializer.errors)

    def test_end_time_must_be_after_start_time(self):
        data = self.data
        data["start_time"] = "10:00:00"
        data["end_time"] = "09:00:00"

        serializer = SaveTimeBlockSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("non_field_errors", serializer.errors)
        self.assertIn("end_time must be after start_time", serializer.errors["non_field_errors"])
    
    def test_equal_start_and_end_time_fails(self):
        data = self.data
        data["start_time"] = "10:00:00"
        data["end_time"] = "10:00:00"

        serializer = SaveTimeBlockSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("non_field_errors", serializer.errors)

    def test_location_and_description_default_to_empty_string(self):
        data = self.data
        data.pop("location")
        data.pop("description")

        serializer = SaveTimeBlockSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertEqual(serializer.validated_data["location"], "")
        self.assertEqual(serializer.validated_data["description"], "")
    

class TestsaveWeeklyPlanSerializer(TestCase):

    def test_valid_data_passes(self):
        data = { "week_start": "2026-03-09", "events": [valid_event()], }

        serializer = SaveWeeklyPlanSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_week_start_is_required(self):
        data = { "events": [valid_event()], }

        serializer = SaveWeeklyPlanSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("week_start", serializer.errors)

    def test_events_is_required(self):
        data = { "week_start": "2026-03-09", }

        serializer = SaveWeeklyPlanSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("events", serializer.errors)

    def test_week_start_accepts_alternative_date_format(self):
        data = { "week_start": "09/03/2026", "events": [valid_event()], }

        serializer = SaveWeeklyPlanSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
    
    def test_empty_events_fails(self):
        data = { "week_start": "2026-03-09", "events": [], }

        serializer = SaveWeeklyPlanSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("events", serializer.errors)