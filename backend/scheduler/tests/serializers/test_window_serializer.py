from django.test import TestCase

from scheduler.serializers.window_serializer import WindowSerializer
from tests.helpers.serializer_data import make_window_data


class WindowSerializerTest(TestCase):
    def setUp(self):
        """Set up reusable valid payload data for window serializer tests."""
        self.data = make_window_data(start_min="07:00", end_min="22:00", daily=False)

    def test_valid_basic(self):
        """Test that valid basic data passes validation and daily defaults to False."""
        serializer = WindowSerializer(data=self.data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertEqual(serializer.validated_data["daily"], False)

    def test_valid_with_daily_true(self):
        """Test that valid data with daily set to True passes validation."""
        data = {**self.data, "start_min": "06:00", "end_min": "23:00", "daily": True}
        serializer = WindowSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertTrue(serializer.validated_data["daily"])

    def test_valid_daily_defaults_false(self):
        """Test that daily defaults to False when omitted."""
        data = {**self.data}
        data.pop("daily")
        serializer = WindowSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertFalse(serializer.validated_data["daily"])

    def test_valid_midnight_wrap(self):
        """Test that a window spanning across midnight is accepted."""
        data = {**self.data, "start_min": "22:00", "end_min": "06:00"}
        serializer = WindowSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_valid_with_seconds(self):
        """Test that valid time values including seconds are accepted."""
        data = {**self.data, "start_min": "07:00:00", "end_min": "22:30:00"}
        serializer = WindowSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_start_min_lower_bound_is_valid(self):
        """Test that the lower valid time bound is accepted."""
        data = {**self.data, "start_min": "00:00", "end_min": "23:59", "daily": True}
        serializer = WindowSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_end_min_24_00_is_invalid(self):
        """Test that 24:00 is rejected as an invalid time."""
        data = {**self.data, "start_min": "00:00", "end_min": "24:00", "daily": True}
        serializer = WindowSerializer(data=data)
        self.assertFalse(serializer.is_valid())

    def test_end_min_25_59_is_invalid(self):
        """Test that times beyond 24 hours are rejected."""
        data = {**self.data, "start_min": "00:00", "end_min": "25:59", "daily": True}
        serializer = WindowSerializer(data=data)
        self.assertFalse(serializer.is_valid())

    def test_missing_start_min(self):
        """Test that validation fails when start_min is missing."""
        data = {**self.data}
        del data["start_min"]
        serializer = WindowSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("start_min", serializer.errors)

    def test_missing_end_min(self):
        """Test that validation fails when end_min is missing."""
        data = {**self.data}
        del data["end_min"]
        serializer = WindowSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("end_min", serializer.errors)

    def test_missing_both_fields(self):
        """Test that validation fails when both required fields are missing."""
        serializer = WindowSerializer(data={})
        self.assertFalse(serializer.is_valid())
        self.assertIn("start_min", serializer.errors)
        self.assertIn("end_min", serializer.errors)

    def test_invalid_time_format(self):
        """Test that invalid time formats are rejected."""
        data = {**self.data, "start_min": "not-a-time"}
        serializer = WindowSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("start_min", serializer.errors)

    def test_same_start_and_end(self):
        """Test that identical start and end times are rejected."""
        data = {**self.data, "start_min": "07:00", "end_min": "07:00"}
        serializer = WindowSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("end_min", serializer.errors)