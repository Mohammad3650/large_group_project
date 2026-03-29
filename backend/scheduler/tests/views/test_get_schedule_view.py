from django.urls import reverse
from rest_framework.test import APITestCase
from datetime import date, time
from scheduler.models.User import User
from scheduler.models.DayPlan import DayPlan
from scheduler.models.TimeBlock import TimeBlock


class GetScheduleViewTest(APITestCase):
    """
    Set up two users, their DayPlans, and associated TimeBlocks for testing
    schedule retrieval and access control behaviour.

    Includes:
    - A primary user with one TimeBlock
    - A second user with a separate TimeBlock (to test data isolation)
    - The endpoint URL for retrieving schedules
    """

    def setUp(self):
        self.user = User.objects.create_user(
            username="test-user", email="test@test.com", password="password123"
        )

        self.other_user = User.objects.create_user(
            username="other-user", email="other@test.com", password="password123"
        )

        self.day_plan = DayPlan.objects.create(user=self.user, date=date(2026, 2, 18))

        self.other_day_plan = DayPlan.objects.create(
            user=self.other_user, date=date(2026, 2, 18)
        )

        # time block for main user
        self.block = TimeBlock.objects.create(
            day=self.day_plan,
            name="Study Session",
            location="Library",
            start_time=time(9, 0),
            end_time=time(10, 0),
            block_type="study",
        )

        # time block for other user
        self.other_block = TimeBlock.objects.create(
            day=self.other_day_plan,
            name="Gym",
            location="Gym",
            start_time=time(11, 0),
            end_time=time(12, 0),
            block_type="exercise",
        )

        self.url = reverse("api-get-timeblocks")

    def test_get_schedule_requires_authentication(self):
        """Ensure unauthenticated users cannot access schedules."""
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 401)

    def test_get_schedule_returns_user_blocks(self):
        """Authenticated user should receive their own time blocks."""
        self.client.force_authenticate(user=self.user)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["name"], "Study Session")

    def test_get_schedule_excludes_other_users_blocks(self):
        """Ensure schedule does not include blocks belonging to other users."""
        self.client.force_authenticate(user=self.user)

        response = self.client.get(self.url)

        names = [block["name"] for block in response.data]
        self.assertNotIn("Gym", names)

    def test_get_schedule_empty(self):
        """User with no time blocks should receive an empty list."""
        empty_user = User.objects.create_user(
            username="emptyuser", password="password123"
        )

        self.client.force_authenticate(user=empty_user)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, [])

    def test_get_in_edit_timeblock(self):
        """Authenticated user should be able to see their own previously saved timeblocks."""
        self.client.force_authenticate(user=self.user)

        url = reverse("api-edit-timeblock", args=[self.block.id])
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["name"], "Study Session")
        self.assertIn("date", response.data)
