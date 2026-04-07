from django.test import TestCase
from scheduler.serializers.time_block_serializer import TimeBlockSerializer
from datetime import date, time
from scheduler.models.User import User
from scheduler.models.DayPlan import DayPlan
from scheduler.models.TimeBlock import TimeBlock


class TimeBlockSerializerTest(TestCase):
    """
    Unit tests for the TimeBlockSerializer validation logic.

    These tests focus purely on serializer-level validation:
    - Required fields
    - Optional fields
    - Rules(start time before end time)

    Although many of these scenarios are also tested in the
    CreateScheduleTest (API tests), this is intentional and not duplication.

    Reason:
    - Serializer tests validate data in isolation
    - API tests validate the full request/response cycle (view + serializer + DB + auth).

    This separation ensures:
    - Validation logic can be tested quickly and in isolation.
    - Integration issues (e.g. serializer not enforced in the view) are still caught.

    Therefore, repeating similar test cases across serializer and API layers
    is necessary to ensure both correctness of the system.
    """

    def setUp(self):
        self.base_data = {
            "date": "2026-02-18",
            "name": "Study Session",
            "location": "Online",
            "start_time": "09:00",
            "end_time": "10:00",
            "block_type": "study",
            "timezone": "Europe/London",
            "description": "Studying OSC for the exam soon",
        }

    def test_get_date_returns_correct_date_string(self):
        user = User.objects.create_user(username="testuser", password="password123")
        day_plan = DayPlan.objects.create(user=user, date=date(2026, 2, 18))
        block = TimeBlock.objects.create(
            day=day_plan,
            block_type="study",
            start_time=time(9, 0),
            end_time=time(10, 0),
            name="Study Session",
            location="Library",
            timezone="Europe/London",
        )
        serializer = TimeBlockSerializer(block)
        self.assertEqual(serializer.data["date"], "2026-02-18")

    def test_valid_data_without_description(self):
        data_without_description = self.base_data.copy()
        data_without_description.pop("description")

        serializer = TimeBlockSerializer(data=data_without_description)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_valid_data_with_description(self):
        serializer = TimeBlockSerializer(data=self.base_data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_invalid_time_order(self):
        data_with_invalid_time_order = self.base_data.copy()
        data_with_invalid_time_order.update(
            {"start_time": "10:00", "end_time": "09:00"}
        )

        serializer = TimeBlockSerializer(data=data_with_invalid_time_order)
        self.assertFalse(serializer.is_valid())

    def test_missing_name_field(self):
        data_without_name = self.base_data.copy()
        data_without_name.pop("name")

        serializer = TimeBlockSerializer(data=data_without_name)
        self.assertFalse(serializer.is_valid())
        self.assertIn("name", serializer.errors)

    def test_missing_end_time(self):
        data_without_end_time = self.base_data.copy()
        data_without_end_time.pop("end_time")

        serializer = TimeBlockSerializer(data=data_without_end_time)
        self.assertFalse(serializer.is_valid())
        self.assertIn("end_time", serializer.errors)

    def test_missing_start_time(self):
        data_without_start_time = self.base_data.copy()
        data_without_start_time.pop("start_time")

        serializer = TimeBlockSerializer(data=data_without_start_time)
        self.assertFalse(serializer.is_valid())
        self.assertIn("start_time", serializer.errors)

    def test_invalid_without_location(self):
        data_without_location = self.base_data.copy()
        data_without_location.pop("location")

        serializer = TimeBlockSerializer(data=data_without_location)
        self.assertFalse(serializer.is_valid())
        self.assertIn("location", serializer.errors)

    def test_completed_at_included_in_serializer_fields(self):
        self.assertIn("completed_at", TimeBlockSerializer.Meta.fields)

    def test_pinned_included_in_serializer_fields(self):
        self.assertIn("pinned", TimeBlockSerializer.Meta.fields)

    def test_pinned_at_included_in_serializer_fields(self):
        self.assertIn("pinned_at", TimeBlockSerializer.Meta.fields)

    def test_valid_data_with_pinned_true(self):
        data = self.base_data.copy()
        data["pinned"] = "True"
        data["pinned_at"] = "2026-02-18T09:00:00Z"
        serializer = TimeBlockSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_valid_data_with_completed_at(self):
        data = self.base_data.copy()
        data["completed_at"] = "2026-02-18T10:00:00Z"
        serializer = TimeBlockSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

