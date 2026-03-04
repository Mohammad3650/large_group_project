from django.test import TestCase
from scheduler.api.serializers import WindowSerializer, FixedEventSerializer, UnscheduledSerializer, GenerateScheduleRequestSerializer

class TestWindowSerializer(TestCase):

    def test_valid_data(self):
        data = {"start_min": 480, "end_min": 720}
        serializer = WindowSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_end_must_be_greater_than_start(self):
        data = {"start_min": 480, "end_min": 480}
        serializer = WindowSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("non_field_errors", serializer.errors)

    def test_min_bounds(self):
        data = {"start_min": -1, "end_min": 10}
        serializer = WindowSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("start_min", serializer.errors)

class TestFixedEventSerializer(TestCase):

    def test_valid_data(self):
        data = { "start_min": 600, "end_min": 660, "name": "FC2 Lecture" }
        serializer = FixedEventSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_end_must_be_greater_than_start(self):
        data = { "start_min": 600, "end_min": 600, "name": "Invalid Event" }
        serializer = FixedEventSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("non_field_errors", serializer.errors)

    def test_negative_start_not_allowed(self):
        data = { "start_min": -10, "end_min": 60, "name": "Bad Event" }
        serializer = FixedEventSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("start_min", serializer.errors)

    def test_end_minimum_bound(self):
        data = { "start_min": 0, "end_min": 0}
        serializer = FixedEventSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("end_min", serializer.errors)

    def test_missing_name_field(self):
        data = { "start_min": 600, "end_min": 660 }
        serializer = FixedEventSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("name", serializer.errors)

class TestUnscheduledSerializer(TestCase):
    def test_valid_data(self):
        data = {"duration_mins": 60, "name": "Gym"}
        serializer = UnscheduledSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_duration_mins_must_be_at_least_1(self):
        data = {"duration_mins": 0, "name": "Gym"}
        serializer = UnscheduledSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("duration_mins", serializer.errors)

    def test_duration_mins_negative_invalid(self):
        data = {"duration_mins": -10, "name": "Gym"}
        serializer = UnscheduledSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("duration_mins", serializer.errors)

    def test_missing_duration_mins(self):
        data = {"name": "Gym"}
        serializer = UnscheduledSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("duration_mins", serializer.errors)

    def test_missing_name(self):
        data = {"duration_mins": 60}
        serializer = UnscheduledSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("name", serializer.errors)

