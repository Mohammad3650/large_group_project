from datetime import date, time

from django.test import TestCase

from scheduler.models.DayPlan import DayPlan
from scheduler.models.TimeBlock import TimeBlock
from scheduler.models.User import User
from scheduler.services.time_block_service import (
    create_time_block,
    get_or_create_day_plan,
    update_time_block,
)
from scheduler.utils.to_utc import to_utc


class TimeblockServiceTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="timeblockuser",
            password="password123",
        )
        self.day_plan = DayPlan.objects.create(
            user=self.user,
            date=date(2026, 1, 15),
        )

        self.base_data = {
            "name": "Default Event",
            "start_time": "09:00",
            "end_time": "10:00",
            "location": "Default Location",
            "block_type": "lecture",
            "description": "Default description",
            "timezone": "UTC",
        }

        self.base_update_data = {
            "name": "Updated Event",
            "start_time": "14:00",
            "end_time": "15:00",
            "location": "Updated Location",
            "block_type": "tutorial",
            "description": "Updated description",
            "timezone": "UTC",
        }

    def test_get_or_create_day_plan_returns_existing_dayplan(self):
        """
        Test that an existing DayPlan is returned and no duplicate is created.
        """
        dayplan = get_or_create_day_plan(self.user, date(2026, 1, 15))

        self.assertEqual(dayplan.id, self.day_plan.id)
        self.assertEqual(DayPlan.objects.filter(user=self.user).count(), 1)

    def test_get_or_create_day_plan_creates_new_day_plan(self):
        """
        Test that a new DayPlan is created when one does not exist.
        """
        dayplan = get_or_create_day_plan(self.user, date(2026, 1, 16))

        self.assertEqual(dayplan.user, self.user)
        self.assertEqual(dayplan.date, date(2026, 1, 16))
        self.assertEqual(DayPlan.objects.filter(user=self.user).count(), 2)

    def test_create_time_block_stores_timezone_and_converts_to_utc(self):
        """
        Test that creating a TimeBlock correctly:
        - converts times to UTC
        - stores timezone and other fields
        """
        july_day_plan = DayPlan.objects.create(
            user=self.user,
            date=date(2026, 7, 15),
        )

        data = self.base_data.copy()
        data.update(
            {
                "name": "Morning Lecture",
                "timezone": "Europe/London",
                "location": "Campus",
                "description": "Attend class",
            }
        )

        block = create_time_block(july_day_plan, data, "2026-07-15")

        expected_start_time, expected_start_date = to_utc(
            "09:00",
            "2026-07-15",
            "Europe/London",
        )
        expected_end_time, _ = to_utc(
            "10:00",
            "2026-07-15",
            "Europe/London",
        )

        self.assertEqual(block.start_time, expected_start_time)
        self.assertEqual(block.end_time, expected_end_time)
        self.assertEqual(block.day.date, expected_start_date)
        self.assertEqual(block.timezone, "Europe/London")
        self.assertEqual(block.location, "Campus")
        self.assertEqual(block.description, "Attend class")

    def test_create_time_block_moves_to_different_dayplan_when_utc_date_changes(self):
        """
        Test that a TimeBlock is moved to a different DayPlan if UTC conversion changes the date.
        """
        data = self.base_data.copy()
        data.update(
            {
                "name": "Late Study",
                "start_time": "23:30",
                "end_time": "23:59",
                "location": "Home",
                "block_type": "study",
                "description": "Late revision",
                "timezone": "America/New_York",
            }
        )

        block = create_time_block(self.day_plan, data, "2026-01-15")

        expected_start_time, expected_start_date = to_utc(
            "23:30",
            "2026-01-15",
            "America/New_York",
        )

        self.assertEqual(block.start_time, expected_start_time)
        self.assertEqual(block.day.date, expected_start_date)
        self.assertTrue(
            DayPlan.objects.filter(user=self.user, date=expected_start_date).exists()
        )

    def test_update_time_block_updates_fields_and_timezone(self):
        """
        Test that updating a TimeBlock correctly updates:
        - all fields
        - UTC conversion
        - timezone
        """
        block = TimeBlock.objects.create(
            day=self.day_plan,
            name="Old Lecture",
            start_time=time(9, 0),
            end_time=time(10, 0),
            location="Old Room",
            block_type="lecture",
            description="Old description",
            timezone="UTC",
        )

        data = self.base_update_data.copy()
        data.update(
            {
                "name": "Updated Tutorial",
                "timezone": "Europe/London",
                "location": "New Room",
            }
        )

        updated_block = update_time_block(
            block,
            self.day_plan,
            data,
            "2026-01-15",
        )

        expected_start_time, expected_start_date = to_utc(
            "14:00",
            "2026-01-15",
            "Europe/London",
        )
        expected_end_time, _ = to_utc(
            "15:00",
            "2026-01-15",
            "Europe/London",
        )

        self.assertEqual(updated_block.name, "Updated Tutorial")
        self.assertEqual(updated_block.start_time, expected_start_time)
        self.assertEqual(updated_block.end_time, expected_end_time)
        self.assertEqual(updated_block.day.date, expected_start_date)
        self.assertEqual(updated_block.location, "New Room")
        self.assertEqual(updated_block.block_type, "tutorial")
        self.assertEqual(updated_block.description, "Updated description")
        self.assertEqual(updated_block.timezone, "Europe/London")

    def test_update_time_block_moves_dayplan_when_utc_date_changes(self):
        """
        Test that updating a TimeBlock moves it to a new DayPlan when UTC conversion changes the date.
        """
        block = TimeBlock.objects.create(
            day=self.day_plan,
            name="Late Event",
            start_time=time(9, 0),
            end_time=time(10, 0),
            location="Old Room",
            block_type="lecture",
            description="Old description",
            timezone="UTC",
        )

        data = self.base_update_data.copy()
        data.update(
            {
                "name": "Late Event Updated",
                "start_time": "23:30",
                "end_time": "23:59",
                "location": "Home",
                "block_type": "study",
                "description": "Late update",
                "timezone": "America/New_York",
            }
        )

        updated_block = update_time_block(
            block,
            self.day_plan,
            data,
            "2026-01-15",
        )

        expected_start_time, expected_start_date = to_utc(
            "23:30",
            "2026-01-15",
            "America/New_York",
        )

        self.assertEqual(updated_block.start_time, expected_start_time)
        self.assertEqual(updated_block.day.date, expected_start_date)
        self.assertTrue(
            DayPlan.objects.filter(user=self.user, date=expected_start_date).exists()
        )
