from django.test import TestCase

from scheduler.serializers.save_time_block_serializer import SaveTimeBlockSerializer
from scheduler.models.TimeBlock import TimeBlock


class SaveTimeBlockSerializerTest(TestCase):
    """Tests for the SaveTimeBlockSerializer."""

    def setUp(self):
        """Create reusable valid time block data for each test."""
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
        """Verify the serializer is valid when given correct time block data."""
        serializer = SaveTimeBlockSerializer(data=self.data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_missing_date_fails(self):
        """Verify the serializer rejects input when date is missing."""
        self.data.pop("date")

        serializer = SaveTimeBlockSerializer(data=self.data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("non_field_errors", serializer.errors)

    def test_missing_start_time_fails(self):
        """Verify the serializer rejects input when start_time is missing."""
        self.data.pop("start_time")

        serializer = SaveTimeBlockSerializer(data=self.data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("non_field_errors", serializer.errors)

    def test_missing_end_time_fails(self):
        """Verify the serializer rejects input when end_time is missing."""
        self.data.pop("end_time")

        serializer = SaveTimeBlockSerializer(data=self.data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("non_field_errors", serializer.errors)

    def test_end_time_must_be_after_start_time(self):
        """Verify the serializer rejects cases where end_time is before start_time."""
        self.data["start_time"] = "10:00:00"
        self.data["end_time"] = "09:00:00"

        serializer = SaveTimeBlockSerializer(data=self.data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("non_field_errors", serializer.errors)
        self.assertIn(
            "end_time must be after start_time",
            serializer.errors["non_field_errors"],
        )

    def test_equal_start_and_end_time_fails(self):
        """Verify the serializer rejects cases where start_time equals end_time."""
        self.data["start_time"] = "10:00:00"
        self.data["end_time"] = "10:00:00"

        serializer = SaveTimeBlockSerializer(data=self.data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("non_field_errors", serializer.errors)

    def test_location_and_description_default_to_empty_string(self):
        """Verify location and description default to empty strings when omitted."""
        self.data.pop("location")
        self.data.pop("description")

        serializer = SaveTimeBlockSerializer(data=self.data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertEqual(serializer.validated_data["location"], "")
        self.assertEqual(serializer.validated_data["description"], "")