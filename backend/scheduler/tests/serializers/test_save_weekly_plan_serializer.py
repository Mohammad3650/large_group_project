from django.test import TestCase

from scheduler.serializers.save_weekly_plan_serializer import SaveWeeklyPlanSerializer


class SaveWeeklyPlanSerializerTest(TestCase):
    """Tests for the SaveWeeklyPlanSerializer."""

    def setUp(self):
        """Create reusable valid serializer input data for each test."""
        self.data = {
            "week_start": "2026-03-09",
            "events": [
                {
                    "date": "2026-03-16",
                    "name": "Lecture",
                    "start_time": "09:00",
                    "end_time": "10:30",
                    "block_type": "lecture",
                    "location": "campus",
                }
            ],
        }

    def test_valid_data_passes(self):
        """Verify the serializer is valid when given correct weekly plan data."""
        serializer = SaveWeeklyPlanSerializer(data=self.data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_week_start_is_required(self):
        """Verify the serializer rejects input when week_start is missing."""
        self.data.pop("week_start")

        serializer = SaveWeeklyPlanSerializer(data=self.data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("week_start", serializer.errors)

    def test_events_is_required(self):
        """Verify the serializer rejects input when events is missing."""
        self.data.pop("events")

        serializer = SaveWeeklyPlanSerializer(data=self.data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("events", serializer.errors)

    def test_week_start_accepts_alternative_date_format(self):
        """Verify the serializer accepts week_start in an alternative date format."""
        self.data["week_start"] = "09/03/2026"

        serializer = SaveWeeklyPlanSerializer(data=self.data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_empty_events_fails(self):
        """Verify the serializer rejects input when events is an empty list."""
        self.data["events"] = []

        serializer = SaveWeeklyPlanSerializer(data=self.data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("events", serializer.errors)