from datetime import date, time

from django.test import TestCase

from scheduler.models.DayPlan import DayPlan
from scheduler.models.TimeBlock import TimeBlock
from scheduler.models.User import User
from scheduler.services.timeblock_service import (
    create_timeblock,
    get_or_create_dayplan,
    update_timeblock,
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

    def test_get_or_create_dayplan_returns_existing_dayplan(self):
        dayplan = get_or_create_dayplan(self.user, date(2026, 1, 15))

        self.assertEqual(dayplan.id, self.day_plan.id)
        self.assertEqual(DayPlan.objects.filter(user=self.user).count(), 1)

    def test_get_or_create_dayplan_creates_new_dayplan(self):
        dayplan = get_or_create_dayplan(self.user, date(2026, 1, 16))

        self.assertEqual(dayplan.user, self.user)
        self.assertEqual(dayplan.date, date(2026, 1, 16))
        self.assertEqual(DayPlan.objects.filter(user=self.user).count(), 2)

    def test_create_timeblock_stores_timezone_and_converts_to_utc(self):
        july_day_plan = DayPlan.objects.create(
            user=self.user,
            date=date(2026, 7, 15),
        )
        data = {
            "name": "Morning Lecture",
            "start_time": "09:00",
            "end_time": "10:00",
            "location": "Campus",
            "block_type": "lecture",
            "description": "Attend class",
            "timezone": "Europe/London",
        }

        block = create_timeblock(july_day_plan, data, "2026-07-15")

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

    def test_create_timeblock_moves_to_different_dayplan_when_utc_date_changes(self):
        data = {
            "name": "Late Study",
            "start_time": "23:30",
            "end_time": "23:59",
            "location": "Home",
            "block_type": "study",
            "description": "Late revision",
            "timezone": "America/New_York",
        }

        block = create_timeblock(self.day_plan, data, "2026-01-15")

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

    def test_update_timeblock_updates_fields_and_timezone(self):
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

        updated_data = {
            "name": "Updated Tutorial",
            "start_time": "14:00",
            "end_time": "15:00",
            "location": "New Room",
            "block_type": "tutorial",
            "description": "Updated description",
            "timezone": "Europe/London",
        }

        updated_block = update_timeblock(
            block,
            self.day_plan,
            updated_data,
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

    def test_update_timeblock_moves_dayplan_when_utc_date_changes(self):
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

        updated_data = {
            "name": "Late Event Updated",
            "start_time": "23:30",
            "end_time": "23:59",
            "location": "Home",
            "block_type": "study",
            "description": "Late update",
            "timezone": "America/New_York",
        }

        updated_block = update_timeblock(
            block,
            self.day_plan,
            updated_data,
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