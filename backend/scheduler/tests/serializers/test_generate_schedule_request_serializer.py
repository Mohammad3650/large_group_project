from django.test import TestCase

from scheduler.serializers.generator_serializer import GenerateScheduleRequestSerializer
from tests.helpers.serializer_data import (
    make_generate_schedule_data,
    make_unscheduled_data,
    make_window_data,
)


class GenerateScheduleRequestSerializerTest(TestCase):
    """Tests for the GenerateScheduleRequestSerializer"""
    def setUp(self):
        """Set up reusable valid payload data for generate schedule request serializer tests."""
        self.data = make_generate_schedule_data()

    def test_full_payload(self):
        """Test that a full valid payload passes validation."""
        data = {
            **self.data,
            "windows": [make_window_data(start_min="07:30", end_min="23:00", daily=True)],
            "unscheduled": [
                make_unscheduled_data(
                    name="Gym",
                    duration="45",
                    frequency="3",
                    daily=False,
                    start_time_preference="Late",
                    location="Gym",
                    block_type="exercise",
                    description="Go to gym",
                ),
                make_unscheduled_data(
                    name="Revision",
                    duration="120",
                    frequency="1",
                    daily=True,
                    start_time_preference="None",
                    location="Library",
                    block_type="study",
                    description="Revision of modules",
                ),
            ],
        }
        serializer = GenerateScheduleRequestSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_days_calculated_correctly(self):
        """Test that the serializer calculates the number of days correctly."""
        data = {**self.data, "week_start": "2026-03-16", "week_end": "2026-03-21"}
        serializer = GenerateScheduleRequestSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertEqual(serializer.validated_data["days"], 6)

    def test_same_start_and_end_date(self):
        """Test that identical start and end dates produce one day."""
        data = {**self.data, "week_start": "2026-03-16", "week_end": "2026-03-16"}
        serializer = GenerateScheduleRequestSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertEqual(serializer.validated_data["days"], 1)

    def test_defaults_applied(self):
        """Test that defaults are applied for optional fields."""
        data = {
            "week_start": "2026-03-16",
            "week_end": "2026-03-21",
            "windows": [make_window_data()],
        }
        serializer = GenerateScheduleRequestSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertTrue(serializer.validated_data["even_spread"])
        self.assertTrue(serializer.validated_data["include_scheduled"])
        self.assertEqual(serializer.validated_data["unscheduled"], [])

    def test_multiple_windows(self):
        """Test that multiple scheduling windows are accepted."""
        data = {
            **self.data,
            "windows": [
                make_window_data(start_min="06:00", end_min="12:00"),
                make_window_data(start_min="13:00", end_min="22:00"),
            ],
        }
        serializer = GenerateScheduleRequestSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_empty_unscheduled_list(self):
        """Test that an explicitly empty unscheduled list is valid."""
        data = {**self.data, "unscheduled": []}
        serializer = GenerateScheduleRequestSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_missing_week_start(self):
        """Test that validation fails when week_start is missing."""
        data = {**self.data}
        del data["week_start"]
        serializer = GenerateScheduleRequestSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertEqual(serializer.errors["week_start"][0], "Start date must be provided.")

    def test_null_week_start(self):
        """Test that validation fails when week_start is null."""
        data = {**self.data, "week_start": None}
        serializer = GenerateScheduleRequestSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertEqual(serializer.errors["week_start"][0], "Start date must be provided.")

    def test_invalid_week_start(self):
        """Test that validation fails when week_start is not a valid date."""
        data = {**self.data, "week_start": "not-a-date"}
        serializer = GenerateScheduleRequestSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertEqual(serializer.errors["week_start"][0], "Start date must be a valid date.")

    def test_missing_week_end(self):
        """Test that validation fails when week_end is missing."""
        data = {**self.data}
        del data["week_end"]
        serializer = GenerateScheduleRequestSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertEqual(serializer.errors["week_end"][0], "End date must be provided.")

    def test_invalid_week_end(self):
        """Test that validation fails when week_end is not a valid date."""
        data = {**self.data, "week_end": "not-a-date"}
        serializer = GenerateScheduleRequestSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertEqual(serializer.errors["week_end"][0], "End date must be a valid date.")

    def test_week_end_before_week_start(self):
        """Test that validation fails when week_end is before week_start."""
        data = {**self.data, "week_start": "2026-03-21", "week_end": "2026-03-16"}
        serializer = GenerateScheduleRequestSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertEqual(
            serializer.errors["week_end"][0],
            "End date must be on or after start date.",
        )

    def test_missing_windows(self):
        """Test that validation fails when windows is missing."""
        data = {**self.data}
        del data["windows"]
        serializer = GenerateScheduleRequestSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertEqual(
            serializer.errors["windows"][0],
            "At least one scheduling window must be provided.",
        )

    def test_null_windows(self):
        """Test that validation fails when windows is null."""
        data = {**self.data, "windows": None}
        serializer = GenerateScheduleRequestSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertEqual(
            serializer.errors["windows"][0],
            "At least one scheduling window must be provided.",
        )