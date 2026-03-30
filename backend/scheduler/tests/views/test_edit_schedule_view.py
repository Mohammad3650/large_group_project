from django.urls import reverse
from rest_framework.test import APITestCase
from datetime import date, time
from scheduler.models.User import User
from scheduler.models.DayPlan import DayPlan
from scheduler.models.TimeBlock import TimeBlock


class EditScheduleViewTest(APITestCase):
    def setUp(self):
        """
        Set up two users, their associated DayPlans, and TimeBlocks for testing
        edit functionality.

        Includes:
        - A primary user and a second user (for access control tests)
        - A DayPlan and TimeBlock for each user
        - A reusable valid payload for PATCH requests
        """
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

    def test_patch_time_block(self):
        """Authenticated user should be able to edit their own timeblocks."""
        self.client.force_authenticate(user=self.user)

        url = reverse("api-edit-timeblock", args=[self.block.id])
        data_with_updated_name = self.base_data.copy()
        data_with_updated_name.update({"name": "Updated Session"})

        response = self.client.patch(url, data_with_updated_name)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["name"], "Updated Session")

    def test_get_time_block_not_found(self):
        """Authenticated user should not be able to edit non-existent timeblocks."""
        self.client.force_authenticate(user=self.user)

        block_id = self.block.id
        self.block.delete()

        # Confirm block no longer exists
        self.assertFalse(TimeBlock.objects.filter(id=block_id).exists())

        url = reverse("api-edit-timeblock", args=[block_id])
        response = self.client.get(url)

        self.assertEqual(response.status_code, 404)

    def test_patch_time_block_invalid(self):
        """Authenticated user should not be able to edit timeblocks and make them invalid."""
        self.client.force_authenticate(user=self.user)

        # Invalidate the start and end time order
        url = reverse("api-edit-timeblock", args=[self.block.id])
        invalid_data = self.base_data.copy()
        invalid_data.update({"start_time": "10:00", "end_time": "09:00"})

        response = self.client.patch(url, invalid_data)

        self.assertEqual(response.status_code, 400)

    def test_patch_time_block_forbidden_for_other_user(self):
        """Users cannot edit TimeBlocks belonging to other users."""
        self.client.force_authenticate(user=self.user)

        url = reverse("api-edit-timeblock", args=[self.other_block.id])
        data = self.base_data.copy()
        data.update({"name": "Hacked Session"})

        response = self.client.patch(url, data, format="json")

        self.assertEqual(response.status_code, 404)

    def test_get_time_block_forbidden_for_other_user(self):
        """Users cannot view TimeBlocks belonging to other users."""
        self.client.force_authenticate(user=self.user)

        url = reverse("api-edit-timeblock", args=[self.other_block.id])
        response = self.client.get(url)

        self.assertEqual(response.status_code, 404)

    def test_patch_time_block_moves_to_new_day_plan_when_date_changes(self):
        """Editing a timeblock with a new date should move it to a new DayPlan."""
        self.client.force_authenticate(user=self.user)

        new_date = "2026-02-19"  # different from original

        url = reverse("api-edit-timeblock", args=[self.block.id])
        data_with_new_date = self.base_data.copy()
        data_with_new_date.update({"date": new_date})

        response = self.client.patch(url, data_with_new_date, format="json")

        self.assertEqual(response.status_code, 200)

        self.block.refresh_from_db()
        self.assertEqual(str(self.block.day.date), new_date)

        # Ensure a new DayPlan was created
        self.assertTrue(DayPlan.objects.filter(user=self.user, date=new_date).exists())
