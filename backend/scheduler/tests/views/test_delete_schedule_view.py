from datetime import date

from django.urls import reverse
from rest_framework.test import APITestCase
from scheduler.models.User import User

from scheduler.models.DayPlan import DayPlan
from scheduler.models.TimeBlock import TimeBlock


class DeleteScheduleViewTest(APITestCase):
    def setUp(self):
        """
        Set up authenticated user, a second user, and a sample TimeBlock for deletion tests.
        """
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

        self.url = reverse("api-delete-time-block", args=[self.block.id])

    def test_delete_time_block_requires_authentication(self):
        """
        Ensure unauthenticated users cannot delete a time block.
        """
        self.client.force_authenticate(user=None)  # ensure not authenticated
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, 401)

    def test_delete_time_block_success(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.delete(self.url)

        self.assertEqual(response.status_code, 204)
        self.assertFalse(TimeBlock.objects.filter(id=self.block.id).exists())

    def test_delete_other_users_block(self):
        """Ensure a user cannot delete a TimeBlock belonging to another user."""
        self.client.force_authenticate(user=self.other_user)

        response = self.client.delete(self.url)

        self.assertEqual(response.status_code, 404)

    def test_delete_nonexistent_block(self):
        """Deleting a non-existent TimeBlock returns 404."""
        self.client.force_authenticate(user=self.user)

        # First delete – should succeed
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, 204)

        # Confirm block no longer exists
        self.assertFalse(TimeBlock.objects.filter(id=self.block.id).exists())

        # Second delete block no longer exists, should return 404
        response2 = self.client.delete(self.url)
        self.assertEqual(response2.status_code, 404)
