from django.test import TestCase
from datetime import date, time

from scheduler.models.DayPlan import DayPlan
from scheduler.models.TimeBlock import TimeBlock
from scheduler.models.users import User


class TimeBlockModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser", password="password123"
        )
        self.day_plan = DayPlan.objects.create(user=self.user, date=date(2026, 2, 17))

    # test you can create a fixed time block with appropriate fields and should NOT have flexible time block fields
    def test_create_fixed_time_block_without_description(self):
        block = TimeBlock.objects.create(
            day=self.day_plan,
            block_type="lecture",
            is_fixed=True,
            start_time=time(9, 0),
            end_time=time(10, 0),
            description=""
        )

        self.assertEqual(block.block_type, "lecture")
        self.assertTrue(block.is_fixed)
        self.assertEqual(block.start_time, time(9, 0))
        self.assertEqual(block.end_time, time(10, 0))
        self.assertEqual(block.description, "")

    def test_create_flexible_time_block(self):
        block = TimeBlock.objects.create(
            day=self.day_plan,
            block_type="study",
            is_fixed=False,
            duration=120,
            time_of_day_preference="morning",
            start_time=time(0, 0),  # required by model
            end_time=time(0, 0),  # required by model
        )

        self.assertEqual(block.duration, 120)
        self.assertEqual(block.time_of_day_preference, "morning")
        self.assertFalse(block.is_fixed)

    def test_dayplan_has_time_blocks(self):
        block = TimeBlock.objects.create(
            day=self.day_plan,
            block_type="study",
            is_fixed=True,
            start_time=time(14, 0),
            end_time=time(16, 0),
        )

        block2 = TimeBlock.objects.create(
            day=self.day_plan,
            block_type="commute",
            is_fixed=False,
            duration=120,
            time_of_day_preference="morning",
            start_time=time(0, 0),  # required by model
            end_time=time(0, 0),  # required by model
        )

        self.assertEqual(self.day_plan.time_blocks.count(), 2)
        self.assertEqual(self.day_plan.time_blocks.first(), block)

    def test_invalid_block_type(self):
        block = TimeBlock(
            day=self.day_plan,
            block_type="invalid_type",
            is_fixed=True,
            start_time=time(9, 0),
            end_time=time(10, 0),
        )

        with self.assertRaises(Exception):
            block.full_clean()

    def test_create_fixed_time_block_with_description(self):
        block = TimeBlock.objects.create(
            day=self.day_plan,
            block_type="lecture",
            is_fixed=True,
            start_time=time(9, 0),
            end_time=time(10, 0),
            description="attend SEG lecture on campus",
        )

        self.assertEqual(block.block_type, "lecture")
        self.assertTrue(block.is_fixed)
        self.assertEqual(block.start_time, time(9, 0))
        self.assertEqual(block.end_time, time(10, 0))
        self.assertEqual(block.description,"attend SEG lecture on campus")
