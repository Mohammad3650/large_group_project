from datetime import date

from django.urls import reverse
from rest_framework.test import APITestCase

from scheduler.models.User import User
from scheduler.models.DayPlan import DayPlan
from scheduler.models.TimeBlock import TimeBlock


class PinScheduleViewTest(APITestCase):
    def setUp(self):
        """Sets up an authenticated user, a second user, and a sample TimeBlock for pin tests."""
        self.user = User.objects.create_user(
            username="test-user",
            email="test@test.com",
            password="password123",
            first_name="Test",
            last_name="User",
            phone_number="01122334455",
        )

        self.other_user = User.objects.create_user(
            username="other-user",
            email="other@test.com",
            password="password123",
            first_name="Other",
            last_name="User",
            phone_number="01122334456",
        )

        self.client.force_authenticate(user=self.user)

        self.day_plan = DayPlan.objects.create(user=self.user, date=date(2026, 2, 18))

        self.block = TimeBlock.objects.create(
            day=self.day_plan,
            name="Study",
            block_type="study",
            location="Library",
            start_time="09:00",
            end_time="10:00",
        )

        self.url = reverse("api-pin-time-block", args=[self.block.id])

    def test_pin_time_block_requires_authentication(self):
        """Tests that unauthenticated users cannot pin a time block."""
        self.client.force_authenticate(user=None)
        response = self.client.patch(self.url)
        self.assertEqual(response.status_code, 401)

    def test_pin_time_block_success(self):
        """Tests that a time block is successfully pinned."""
        response = self.client.patch(self.url)
        self.assertEqual(response.status_code, 200)
        self.block.refresh_from_db()
        self.assertTrue(self.block.pinned)
        self.assertIsNotNone(self.block.pinned_at)

    def test_pin_time_block_other_users_block_returns_404(self):
        """Tests that a user cannot pin a time block belonging to another user."""
        self.client.force_authenticate(user=self.other_user)
        response = self.client.patch(self.url)
        self.assertEqual(response.status_code, 404)

    def test_pin_nonexistent_block_returns_404(self):
        """Tests that pinning a non-existent time block returns 404."""
        url = reverse("api-pin-time-block", args=[99999])
        response = self.client.patch(url)
        self.assertEqual(response.status_code, 404)
