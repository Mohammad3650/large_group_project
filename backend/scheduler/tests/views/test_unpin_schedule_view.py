from datetime import date

from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APITestCase

from scheduler.models.User import User
from scheduler.models.DayPlan import DayPlan
from scheduler.models.TimeBlock import TimeBlock


class UnpinScheduleViewTest(APITestCase):

    def setUp(self):
        """Sets up an authenticated user, a second user, and a pinned TimeBlock for unpin tests."""
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
            pinned=True,
            pinned_at=timezone.now(),
        )

        self.url = reverse("api-unpin-timeblock", args=[self.block.id])

    def test_unpin_time_block_requires_authentication(self):
        """Tests that unauthenticated users cannot unpin a time block."""
        self.client.force_authenticate(user=None)
        response = self.client.patch(self.url)
        self.assertEqual(response.status_code, 401)

    def test_unpin_time_block_success(self):
        """Tests that a pinned time block is successfully unpinned."""
        response = self.client.patch(self.url)
        self.assertEqual(response.status_code, 200)
        self.block.refresh_from_db()
        self.assertFalse(self.block.pinned)
        self.assertIsNone(self.block.pinned_at)

    def test_unpin_other_users_block_returns_404(self):
        """Tests that a user cannot unpin a time block belonging to another user."""
        self.client.force_authenticate(user=self.other_user)
        response = self.client.patch(self.url)
        self.assertEqual(response.status_code, 404)

    def test_unpin_nonexistent_block_returns_404(self):
        """Tests that unpinning a non-existent time block returns 404."""
        url = reverse("api-unpin-timeblock", args=[99999])
        response = self.client.patch(url)
        self.assertEqual(response.status_code, 404)
