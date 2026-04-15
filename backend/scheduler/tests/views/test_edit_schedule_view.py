from django.urls import reverse
from rest_framework.test import APITestCase
from datetime import date, time
from scheduler.models.User import User
from scheduler.models.DayPlan import DayPlan
from scheduler.models.TimeBlock import TimeBlock
from scheduler.views.edit_schedule_view import (
    get_block_or_404,
    serialize_time_block,
    update_time_fields,
    move_block_if_date_changed,
)


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
            timezone="Europe/London",
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

        url = reverse("api-edit-time-block", args=[self.block.id])
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

        url = reverse("api-edit-time-block", args=[block_id])
        response = self.client.get(url)

        self.assertEqual(response.status_code, 404)

    def test_patch_time_block_invalid(self):
        """Authenticated user should not be able to edit timeblocks and make them invalid."""
        self.client.force_authenticate(user=self.user)

        # Invalidate the start and end time order
        url = reverse("api-edit-time-block", args=[self.block.id])
        invalid_data = self.base_data.copy()
        invalid_data.update({"start_time": "10:00", "end_time": "09:00"})

        response = self.client.patch(url, invalid_data)

        self.assertEqual(response.status_code, 400)

    def test_patch_time_block_forbidden_for_other_user(self):
        """Users cannot edit TimeBlocks belonging to other users."""
        self.client.force_authenticate(user=self.user)

        url = reverse("api-edit-time-block", args=[self.other_block.id])
        data = self.base_data.copy()
        data.update({"name": "Hacked Session"})

        response = self.client.patch(url, data, format="json")

        self.assertEqual(response.status_code, 404)

    def test_get_time_block_forbidden_for_other_user(self):
        """Users cannot view TimeBlocks belonging to other users."""
        self.client.force_authenticate(user=self.user)

        url = reverse("api-edit-time-block", args=[self.other_block.id])
        response = self.client.get(url)

        self.assertEqual(response.status_code, 404)

    def test_patch_time_block_moves_to_new_day_plan_when_date_changes(self):
        """Editing a timeblock with a new date should move it to a new DayPlan."""
        self.client.force_authenticate(user=self.user)

        new_date = "2026-02-19"  # different from original

        url = reverse("api-edit-time-block", args=[self.block.id])
        data_with_new_date = self.base_data.copy()
        data_with_new_date.update({"date": new_date})

        response = self.client.patch(url, data_with_new_date, format="json")

        self.assertEqual(response.status_code, 200)

        self.block.refresh_from_db()
        self.assertEqual(str(self.block.day.date), new_date)

        # Ensure a new DayPlan was created
        self.assertTrue(DayPlan.objects.filter(user=self.user, date=new_date).exists())

    def test_patch_only_start_time(self):
        self.client.force_authenticate(user=self.user)

        url = reverse("api-edit-time-block", args=[self.block.id])

        data_with_new_start_time = self.base_data.copy()
        data_with_new_start_time.update({"start_time": "08:00"})

        response = self.client.patch(url, data_with_new_start_time, format="json")

        self.assertEqual(response.status_code, 200)

        self.block.refresh_from_db()
        self.assertEqual(self.block.start_time.hour, 8)

    def test_patch_only_end_time(self):
        self.client.force_authenticate(user=self.user)

        url = reverse("api-edit-time-block", args=[self.block.id])

        data_with_new_end_time = self.base_data.copy()
        data_with_new_end_time.update({"end_time": "11:00"})

        response = self.client.patch(url, data_with_new_end_time, format="json")

        self.assertEqual(response.status_code, 200)

        self.block.refresh_from_db()
        self.assertEqual(self.block.end_time.hour, 11)

    def test_patch_same_date_does_not_move_block(self):
        """
        Editing a timeblock without changing the date should not reassign it
        to a different DayPlan.
        """
        self.client.force_authenticate(user=self.user)

        url = reverse("api-edit-time-block", args=[self.block.id])

        data = self.base_data.copy()

        old_day_plan_id = self.block.day.id

        response = self.client.patch(url, data, format="json")

        self.assertEqual(response.status_code, 200)

        self.block.refresh_from_db()
        self.assertEqual(self.block.day.id, old_day_plan_id)

    def test_get_time_block_success(self):
        self.client.force_authenticate(user=self.user)

        url = reverse("api-edit-time-block", args=[self.block.id])
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        self.assertIn("date", response.data)

    def test_patch_without_date_uses_existing(self):
        """
        If no date is provided in the request, the existing date of the
        timeblock should be retained.
        """
        self.client.force_authenticate(user=self.user)

        url = reverse("api-edit-time-block", args=[self.block.id])

        data_without_date = self.base_data.copy()
        data_without_date.pop("date")

        response = self.client.patch(url, data_without_date, format="json")

        self.assertEqual(response.status_code, 200)

    def test_get_time_block_returns_correct_date(self):
        self.client.force_authenticate(user=self.user)

        url = reverse("api-edit-time-block", args=[self.block.id])
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["date"], "2026-02-18")

    def test_patch_serializer_validation_error(self):
        """
        Invalid serializer data should trigger the serializer.is_valid() failure
        and return a 400 response.
        """
        self.client.force_authenticate(user=self.user)

        url = reverse("api-edit-time-block", args=[self.block.id])

        invalid_data = self.base_data.copy()
        invalid_data["name"] = ""

        response = self.client.patch(url, invalid_data, format="json")

        self.assertEqual(response.status_code, 400)

    def test_patch_only_non_time_fields_skips_utc_conversion(self):
        """
        Patching a timeblock with no start_time or end_time in the payload
        exercises the False branches inside apply_utc_time_updates.
        """
        self.client.force_authenticate(user=self.user)

        url = reverse("api-edit-time-block", args=[self.block.id])
        data_updated = self.base_data.copy()
        data_updated.update(
            {
                "name": "Football stretches",
                "location": "Home",
                "block_type": "exercise",
                "date": "2026-02-18",
            }
        )

        response = self.client.patch(url, data_updated, format="json")

        self.assertEqual(response.status_code, 200)
        self.block.refresh_from_db()
        self.assertEqual(self.block.location, "Home")
        self.assertEqual(self.block.name, "Football stretches")
