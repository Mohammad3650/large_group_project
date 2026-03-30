from django.test import TestCase

from scheduler.serializers.unscheduled_serializer import UnscheduledSerializer
from tests.helpers.serializer_data import make_unscheduled_data


class UnscheduledSerializerTest(TestCase):
    """Tests for the UnscheduledSerializer"""
    def setUp(self):
        """Set up reusable valid payload data for unscheduled serializer tests."""
        self.data = make_unscheduled_data()

    def test_minimal_required_fields(self):
        """Test that the minimal valid payload passes validation."""
        serializer = UnscheduledSerializer(data=self.data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_defaults_applied(self):
        """Test that default values are applied for optional fields."""
        serializer = UnscheduledSerializer(data=self.data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertEqual(serializer.validated_data["start_time_preference"], "None")
        self.assertEqual(serializer.validated_data["location"], "")
        self.assertEqual(serializer.validated_data["block_type"], "study")
        self.assertEqual(serializer.validated_data["description"], "")

    def test_all_fields_explicit(self):
        """Test that a payload with all fields explicitly provided is valid."""
        data = {
            **self.data,
            "duration": 90,
            "name": "exercise",
            "frequency": 5,
            "start_time_preference": "Early",
            "location": "park",
            "block_type": "exercise",
            "description": "workout",
        }
        serializer = UnscheduledSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_daily_true_frequency_one(self):
        """Test that daily tasks are valid when frequency is one."""
        data = {**self.data, "daily": True, "frequency": 1}
        serializer = UnscheduledSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_daily_true_frequency_defaults_to_one(self):
        """Test that a daily task is valid when frequency is omitted and defaults appropriately."""
        data = {**self.data, "name": "Walk", "daily": True}
        data.pop("frequency")
        serializer = UnscheduledSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_all_start_time_preference_choices(self):
        """Test that all valid start time preference choices are accepted."""
        for choice in ["None", "Early", "Late"]:
            with self.subTest(choice=choice):
                data = {**self.data, "start_time_preference": choice}
                serializer = UnscheduledSerializer(data=data)
                self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_all_block_type_choices(self):
        """Test that all valid block type choices are accepted."""
        for block_type in [
            "sleep",
            "study",
            "lecture",
            "lab",
            "tutorial",
            "commute",
            "exercise",
            "break",
            "work",
            "extracurricular",
        ]:
            with self.subTest(block_type=block_type):
                data = {**self.data, "block_type": block_type}
                serializer = UnscheduledSerializer(data=data)
                self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_blank_location_allowed(self):
        """Test that an empty location value is allowed."""
        data = {**self.data, "location": ""}
        serializer = UnscheduledSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_blank_description_allowed(self):
        """Test that an empty description value is allowed."""
        data = {**self.data, "description": ""}
        serializer = UnscheduledSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_missing_duration(self):
        """Test that validation fails when duration is missing."""
        data = {**self.data}
        del data["duration"]
        serializer = UnscheduledSerializer(data=data)
        self.assertFalse(serializer.is_valid())

    def test_null_duration(self):
        """Test that validation fails when duration is null."""
        data = {**self.data, "duration": None}
        serializer = UnscheduledSerializer(data=data)
        self.assertFalse(serializer.is_valid())

    def test_invalid_duration(self):
        """Test that validation fails when duration is not numeric."""
        data = {**self.data, "duration": "abc"}
        serializer = UnscheduledSerializer(data=data)
        self.assertFalse(serializer.is_valid())

    def test_duration_zero(self):
        """Test that validation fails when duration is zero."""
        data = {**self.data, "duration": 0}
        serializer = UnscheduledSerializer(data=data)
        self.assertFalse(serializer.is_valid())

    def test_duration_negative(self):
        """Test that validation fails when duration is negative."""
        data = {**self.data, "duration": -5}
        serializer = UnscheduledSerializer(data=data)
        self.assertFalse(serializer.is_valid())

    def test_duration_one_is_valid(self):
        """Test that duration of one is accepted."""
        data = {**self.data, "duration": 1}
        serializer = UnscheduledSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_blank_name(self):
        """Test that validation fails when name is blank."""
        data = {**self.data, "name": ""}
        serializer = UnscheduledSerializer(data=data)
        self.assertFalse(serializer.is_valid(), serializer.errors)

    def test_invalid_daily(self):
        """Test that validation fails when daily is not a boolean."""
        data = {**self.data, "daily": "maybe"}
        serializer = UnscheduledSerializer(data=data)
        self.assertFalse(serializer.is_valid(), serializer.errors)

    def test_invalid_frequency(self):
        """Test that validation fails when frequency is not numeric."""
        data = {**self.data, "frequency": "often"}
        serializer = UnscheduledSerializer(data=data)
        self.assertFalse(serializer.is_valid(), serializer.errors)

    def test_frequency_negative(self):
        """Test that validation fails when frequency is negative."""
        data = {**self.data, "frequency": -1}
        serializer = UnscheduledSerializer(data=data)
        self.assertFalse(serializer.is_valid(), serializer.errors)

    def test_daily_true_frequency_not_one(self):
        """Test that daily tasks are invalid when frequency is not one."""
        data = {**self.data, "daily": True, "frequency": 3}
        serializer = UnscheduledSerializer(data=data)
        self.assertFalse(serializer.is_valid(), serializer.errors)

    def test_daily_false_frequency_provided(self):
        """Test that non-daily tasks are valid when frequency is provided."""
        data = {**self.data, "daily": False, "frequency": 4}
        serializer = UnscheduledSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)