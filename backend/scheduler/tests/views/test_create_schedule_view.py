from django.urls import reverse
from rest_framework.test import APITestCase
from scheduler.models.User import User
from scheduler.models.TimeBlock import TimeBlock
from datetime import time, date
from zoneinfo import ZoneInfo
from scheduler.utils.to_utc import to_utc


class CreateScheduleTest(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            email="testuser@testuser.com",
            password="password123",
            first_name="test",
            last_name="user",
            phone_number="01122334455",
        )

    def test_create_timeblock_requires_authentication(self):
        url = reverse("api-create-timeblock")

        response = self.client.post(
            url,
            {
                "date": "2026-02-18",
                "name": "Study Session",
                "location": "Online",
                "start_time": "09:00",
                "end_time": "10:00",
                "block_type": "study",
                "timezone": "Europe/London",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 401)

    def test_create_timeblock_without_description(self):
        self.client.force_authenticate(user=self.user)

        url = reverse("api-create-timeblock")

        response = self.client.post(
            url,
            {
                "date": "2026-02-18",
                "name": "Study Session",
                "location": "Online",
                "start_time": "09:00",
                "end_time": "10:00",
                "block_type": "study",
                "timezone": "Europe/London",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)

    def test_create_timeblock_with_description(self):
        self.client.force_authenticate(user=self.user)

        url = reverse("api-create-timeblock")

        response = self.client.post(
            url,
            {
                "date": "2026-02-18",
                "name": "Study Session",
                "location": "Online",
                "start_time": "09:00",
                "end_time": "10:00",
                "block_type": "study",
                "description": "work on course work",
                "timezone": "Europe/London",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)

    def test_create_timeblock_missing_required_field(self):
        self.client.force_authenticate(user=self.user)

        url = reverse("api-create-timeblock")

        response = self.client.post(
            url,
            {
                "date": "2026-02-18",
                # Missing name intentionally
                "end_time": "10:00",
                "block_type": "study",
                "location": "Online",
                "timezone": "Europe/London",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)

    def test_create_timeblock_invalid_time_order(self):
        self.client.force_authenticate(user=self.user)
        url = reverse("api-create-timeblock")

        response = self.client.post(
            url,
            {
                "date": "2026-02-18",
                "name": "Study Session",
                "location": "Online",
                "start_time": "10:00",
                "end_time": "09:00",
                "block_type": "study",
                "timezone": "Europe/London",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)

    def test_create_block_missing_date_field(self):
        self.client.force_authenticate(user=self.user)

        url = reverse("api-create-timeblock")

        response = self.client.post(
            url,
            {
                "name": "No Date Block",
                "end_time": "10:00",
                "block_type": "study",
                "location": "Online",
                "timezone": "Europe/London",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)

    def test_create_block_missing_timezone_field(self):
        self.client.force_authenticate(user=self.user)

        url = reverse("api-create-timeblock")

        response = self.client.post(
            url,
            {
                "date": "2026-02-18",
                "name": "No Timezone Block",
                "end_time": "10:00",
                "block_type": "study",
                "location": "Online",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)

    def test_create_timeblock_cross_midnight(self):
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
