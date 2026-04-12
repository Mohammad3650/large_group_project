from django.http import Http404
from django.urls import reverse
from rest_framework.test import APITestCase
from datetime import date, time
from scheduler.models.User import User
from scheduler.models.DayPlan import DayPlan
from scheduler.models.TimeBlock import TimeBlock
from scheduler.views.edit_schedule_view import serialize_time_block_with_date
from scheduler.views.edit_schedule_view import (
    get_user_time_block,
    apply_utc_time_updates,
    update_time_block_day_if_needed,
    partially_update_time_block,
    serialize_time_block_with_date,
    get_request_timezone_and_date,
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
        invalid_data["name"] = ""  # assuming name is required

        response = self.client.patch(url, invalid_data, format="json")

        self.assertEqual(response.status_code, 400)

    def test_get_request_timezone_and_date_fallback(self):
        """
        Directly test fallback logic for timezone and date helper.
        """
        request = type("Request", (), {"data": {}})()
        timezone, date = get_request_timezone_and_date(request, self.block)

        self.assertEqual(timezone, self.block.timezone)
        self.assertEqual(date, str(self.block.day.date))

    def test_serialize_time_block_with_date(self):
        """
        Serializing a timeblock should include the associated date field.
        """
        data = serialize_time_block_with_date(self.block)

        self.assertIn("date", data)
        self.assertEqual(data["date"], str(self.block.day.date))

    def test_get_user_time_block_returns_correct_block(self):
        block = get_user_time_block(self.user, self.block.id)
        self.assertEqual(block, self.block)

    def test_get_user_time_block_raises_404_for_other_users_block(self):
        """get_user_time_block raises 404 when the block belongs to a different user."""
        with self.assertRaises(Http404):
            get_user_time_block(self.user, self.other_block.id)

    def test_get_request_timezone_and_date_uses_request_data_when_present(self):
        """When timezone and date are present in request data they should be returned directly."""
        request = type(
            "Request", (), {"data": {"timezone": "UTC", "date": "2026-03-01"}}
        )()
        timezone, date = get_request_timezone_and_date(request, self.block)

        self.assertEqual(timezone, "UTC")
        self.assertEqual(date, "2026-03-01")

    def test_apply_utc_time_updates_skips_when_no_times_in_request(self):
        """
        When neither start_time nor end_time is present in request data,
        validated_data should remain unmodified (covers both False branches).
        """
        request = type("Request", (), {"data": {}})()

        class MockSerializer:
            validated_data = {}

        serializer = MockSerializer()
        apply_utc_time_updates(serializer, request, "2026-02-18", "Europe/London")

        self.assertNotIn("start_time", serializer.validated_data)
        self.assertNotIn("end_time", serializer.validated_data)

    def test_update_time_block_day_if_needed_does_nothing_on_same_date(self):
        """
        Calling update_time_block_day_if_needed with the same date should
        leave the block's DayPlan unchanged (covers the early-return branch).
        """
        original_day_id = self.block.day.id
        update_time_block_day_if_needed(self.block, self.user, str(self.block.day.date))
        self.block.refresh_from_db()
        self.assertEqual(self.block.day.id, original_day_id)

    def test_update_time_block_day_if_needed_moves_block_on_date_change(self):
        """
        Calling update_time_block_day_if_needed with a new date should
        reassign the block to a new or existing DayPlan for that date.
        """
        new_date = "2026-03-15"
        update_time_block_day_if_needed(self.block, self.user, new_date)
        self.block.refresh_from_db()
        self.assertEqual(str(self.block.day.date), new_date)
        self.assertTrue(DayPlan.objects.filter(user=self.user, date=new_date).exists())

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

    def test_apply_utc_time_updates_applies_both_times(self):
        """
        When both start_time and end_time are provided, both should be
        converted and added to validated_data.
        """
        request = type(
            "Request",
            (),
            {"data": {"start_time": "09:00", "end_time": "10:00"}},
        )()

        class MockSerializer:
            validated_data = {}

        serializer = MockSerializer()

        apply_utc_time_updates(serializer, request, "2026-02-18", "Europe/London")

        self.assertIn("start_time", serializer.validated_data)
        self.assertIn("end_time", serializer.validated_data)

    def test_partially_update_time_block_invalid_serializer_direct(self):
        """
        Directly calling partially_update_time_block with invalid data
        should return a 400 response.
        """
        request = type(
            "Request",
            (),
            {
                "data": {"name": ""},  # invalid
                "user": self.user,
            },
        )()

        response = partially_update_time_block(request, self.block)

        self.assertEqual(response.status_code, 400)

    def test_partially_update_time_block_success_direct(self):
        """
        Directly calling partially_update_time_block with valid data
        should update and return 200.
        """
        data_partially_updated = self.base_data.copy()
        data_partially_updated.update(
            {
                "name": "Updated Name",
                "date": "2026-02-18",
                "timezone": "Europe/London",
            }
        )

        request = type(
            "Request",
            (),
            {
                "data": data_partially_updated,
                "user": self.user,
            },
        )()

        response = partially_update_time_block(request, self.block)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["name"], "Updated Name")
