from django.urls import reverse
from rest_framework.test import APITestCase
from scheduler.models.User import User
from scheduler.models.TimeBlock import TimeBlock
from scheduler.utils.to_utc import to_utc


class CreateScheduleViewTest(APITestCase):
    def setUp(self):
        """
        Set up a test user and a reusable base payload for creating time blocks.
        """
        self.user = User.objects.create_user(
            username="testuser",
            email="testuser@testuser.com",
            password="password123",
            first_name="test",
            last_name="user",
            phone_number="01122334455",
        )

        self.url = reverse("api-create-timeblock")

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

    def test_create_time_block_requires_authentication(self):
        """
        Ensure unauthenticated users cannot create a time block.
        """
        response = self.client.post(
            self.url,
            self.base_data,
            format="json",
        )

        self.assertEqual(response.status_code, 401)

    def test_create_time_block_without_description_is_allowed(self):
        self.client.force_authenticate(user=self.user)

        data_without_description = self.base_data.copy()
        data_without_description.pop("description")

        response = self.client.post(
            self.url,
            data_without_description,
            format="json",
        )

        self.assertEqual(response.status_code, 201)

    def test_create_time_block_with_description(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            self.url,
            self.base_data,
            format="json",
        )

        self.assertEqual(response.status_code, 201)

    def test_create_time_block_missing_required_field(self):
        """
        Ensure validation fails when required fields are missing.

        In this case, the 'name' field is removed.

        Expected:
            - 400 BAD REQUEST response
        """
        self.client.force_authenticate(user=self.user)

        data_without_name = self.base_data.copy()
        data_without_name.pop("name")

        response = self.client.post(
            self.url,
            data_without_name,
            format="json",
        )

        self.assertEqual(response.status_code, 400)

    def test_create_time_block_invalid_time_order(self):
        """
        Ensure validation fails when start_time is after end_time.

        Expected:
            - 400 BAD REQUEST response
        """
        self.client.force_authenticate(user=self.user)

        data_with_invalid_time_order = self.base_data.copy()
        data_with_invalid_time_order.update(
            {"start_time": "10:00", "end_time": "09:00"}
        )

        response = self.client.post(
            self.url,
            data_with_invalid_time_order,
            format="json",
        )

        self.assertEqual(response.status_code, 400)

    def test_create_block_missing_date_field(self):
        """
        Ensure validation fails when start_time is after end_time.
        Given date field is separate to timeblock this tests a different required field.

        Expected:
            - 400 BAD REQUEST response
        """
        self.client.force_authenticate(user=self.user)

        data_without_date = self.base_data.copy()
        data_without_date.pop("date")

        response = self.client.post(
            self.url,
            data_without_date,
            format="json",
        )

        self.assertEqual(response.status_code, 400)

    def test_create_block_missing_timezone_field(self):
        self.client.force_authenticate(user=self.user)

        data_without_timezone = self.base_data.copy()
        data_without_timezone.pop("timezone")

        response = self.client.post(
            self.url,
            data_without_timezone,
            format="json",
        )

        self.assertEqual(response.status_code, 400)

    def test_create_time_block_cross_midnight(self):
        """Test that a TimeBlock crossing midnight in UTC is assigned to the correct DayPlan."""
        self.client.force_authenticate(user=self.user)

        # Use a timezone that will push the time to the next UTC day
        # For example, 23:30 in New York (UTC-5) becomes 04:30 UTC next day
        url = reverse("api-create-timeblock")
        data = {
            "date": "2026-01-15",  # local date
            "name": "Late Night Study",
            "location": "Home",
            "start_time": "23:30",  # local time
            "end_time": "23:59",
            "block_type": "study",
            "timezone": "America/New_York",  # UTC-5
        }

        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, 201)

        # The TimeBlock should now be associated with the next day in UTC
        created_block = TimeBlock.objects.get(id=response.data["id"])
        expected_utc_time, expected_utc_date = to_utc(
            data["start_time"], data["date"], data["timezone"]
        )

        self.assertEqual(created_block.start_time, expected_utc_time)
        self.assertEqual(str(created_block.day.date), str(expected_utc_date))
