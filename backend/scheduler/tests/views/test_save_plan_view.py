import datetime

from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from scheduler.models import DayPlan, TimeBlock

User = get_user_model()


class SaveWeeklyPlanViewTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser", password="testpass123"
        )
        self.url = reverse("plans-save")

        self.valid_payload = {
            "week_start": "2026-03-09",
            "events": [
                {
                    "date": "2026-03-09",
                    "start_time": "09:00:00",
                    "end_time": "10:00:00",
                    "block_type": "study",
                    "location": "Library",
                    "name": "Maths Revision",
                    "description": "Chapter 1",
                },
                {
                    "date": "2026-03-10",
                    "start_time": "14:00:00",
                    "end_time": "15:30:00",
                    "block_type": "exercise",
                    "location": "Gym",
                    "name": "Workout",
                    "description": "Leg day",
                },
            ],
        }

    def test_post_requires_authentication(self):
        response = self.client.post(self.url, self.valid_payload, format="json")

        self.assertIn(
            response.status_code,
            [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN],
        )

    def test_post_saves_weekly_plan_successfully(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post(self.url, self.valid_payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["message"], "Weekly plan saved")
        self.assertEqual(response.data["events_saved"], 2)

        self.assertEqual(TimeBlock.objects.count(), 2)
        self.assertEqual(DayPlan.objects.count(), 2)

        first_block = TimeBlock.objects.get(name="Maths Revision")
        self.assertEqual(first_block.start_time.isoformat(), "09:00:00")
        self.assertEqual(first_block.end_time.isoformat(), "10:00:00")
        self.assertEqual(first_block.location, "Library")
        self.assertEqual(first_block.block_type, "study")
        self.assertEqual(first_block.description, "Chapter 1")

    def test_post_creates_one_day_plan_for_multiple_events_same_day(self):
        self.client.force_authenticate(user=self.user)

        payload = {
            "week_start": "2026-03-09",
            "events": [
                {
                    "date": "2026-03-09",
                    "start_time": "09:00:00",
                    "end_time": "10:00:00",
                    "block_type": "study",
                    "location": "Library",
                    "name": "Task 1",
                    "description": "",
                },
                {
                    "date": "2026-03-09",
                    "start_time": "11:00:00",
                    "end_time": "12:00:00",
                    "block_type": "study",
                    "location": "Library",
                    "name": "Task 2",
                    "description": "",
                },
            ],
        }

        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["events_saved"], 2)
        self.assertEqual(
            DayPlan.objects.count(), 1
        )  # Only one day_plan object required
        self.assertEqual(TimeBlock.objects.count(), 2)

    def test_post_returns_400_for_invalid_payload(self):
        self.client.force_authenticate(user=self.user)
        payload = {
            "week_start": "2026-03-09",
            "events": [
                {
                    "date": "2026-03-09",
                    "start_time": "10:00:00",
                    "end_time": "09:00:00",  # invalid: end before start
                    "block_type": "study",
                    "location": "Library",
                    "name": "Broken event",
                    "description": "",
                }
            ],
        }
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(TimeBlock.objects.count(), 0)

    def test_post_is_atomic_if_one_event_fails(self):
        self.client.force_authenticate(user=self.user)
        payload = {
            "week_start": "2026-03-09",
            "events": [
                {
                    "date": "2026-03-09",
                    "start_time": "09:00:00",
                    "end_time": "10:00:00",
                    "block_type": "study",
                    "location": "Library",
                    "name": "Valid event",
                    "description": "",
                },
                {
                    "date": "2026-03-09",
                    "start_time": "12:00:00",
                    "end_time": "11:00:00",  # invalid
                    "block_type": "study",
                    "location": "Library",
                    "name": "Invalid event",
                    "description": "",
                },
            ],
        }
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(TimeBlock.objects.count(), 0)
        self.assertEqual(DayPlan.objects.count(), 0)
