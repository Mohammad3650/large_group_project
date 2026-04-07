from django.test import TestCase
from django.utils import timezone
from datetime import date, time

from scheduler.models.DayPlan import DayPlan
from scheduler.models.TimeBlock import TimeBlock
from scheduler.models.User import User


class TimeBlockModelTest(TestCase):
    """Tests for the TimeBlock model."""

    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser", password="password123"
        )
        self.day_plan = DayPlan.objects.create(user=self.user, date=date(2026, 2, 17))

    def test_create_time_block_without_description(self):
        """
        Tests that a TimeBlock can be created without a description.

        Uses self.day_plan from setUp to attach the block to a valid DayPlan.
        Ensures required fields (block_type, start_time, end_time) are stored correctly.
        """
        block = TimeBlock.objects.create(
            day=self.day_plan,
            block_type="lecture",
            start_time=time(9, 0),
            end_time=time(10, 0),
            description="",
        )

        self.assertEqual(block.block_type, "lecture")
        self.assertEqual(block.start_time, time(9, 0))
        self.assertEqual(block.end_time, time(10, 0))
        self.assertEqual(block.description, "")

    def test_day_plan_has_time_blocks(self):
        """
        Tests that multiple TimeBlocks can be associated with a single DayPlan.

        Reuses self.day_plan from setUp to verify the reverse relationship
        (DayPlan → time_blocks).
        """
        block = TimeBlock.objects.create(
            day=self.day_plan,
            block_type="study",
            start_time=time(14, 0),
            end_time=time(16, 0),
        )

        block2 = TimeBlock.objects.create(
            day=self.day_plan,
            block_type="commute",
            start_time=time(16, 0),
            end_time=time(18, 0),
        )

        # Ensure both blocks are linked to the same DayPlan
        self.assertEqual(self.day_plan.time_blocks.count(), 2)

        # Ensure ordering/first object is correct
        self.assertEqual(self.day_plan.time_blocks.first(), block)

    def test_invalid_block_type(self):
        """
        Tests that invalid block types are rejected.

        Uses self.day_plan from setUp and calls full_clean()
        to trigger model validation.
        """
        block = TimeBlock(
            day=self.day_plan,
            block_type="invalid_type",
            start_time=time(9, 0),
            end_time=time(10, 0),
        )

        with self.assertRaises(Exception):
            block.full_clean()

    def test_create_block_with_description(self):
        """
        Tests that a TimeBlock can be created with a description.

        Again reuses self.day_plan from setUp to avoid duplication.
        Verifies that optional fields are stored correctly.
        """
        block = TimeBlock.objects.create(
            day=self.day_plan,
            block_type="lecture",
            start_time=time(9, 0),
            end_time=time(10, 0),
            description="attend SEG lecture on campus",
        )

        self.assertEqual(block.block_type, "lecture")
        self.assertEqual(block.start_time, time(9, 0))
        self.assertEqual(block.end_time, time(10, 0))
        self.assertEqual(block.description, "attend SEG lecture on campus")

    def test_timezone_defaults_to_utc(self):
        """Tests that the timezone defaults to UTC when a TimeBlock is created without specifying one."""
        block = TimeBlock.objects.create(
            day=self.day_plan,
            block_type="lecture",
            start_time=time(9, 0),
            end_time=time(10, 0),
        )
        self.assertEqual(block.timezone, "UTC")

    def test_timezone_can_be_set(self):
        """Tests that the timezone can be set to a custom value when creating a TimeBlock."""
        block = TimeBlock.objects.create(
            day=self.day_plan,
            block_type="lecture",
            start_time=time(9, 0),
            end_time=time(10, 0),
            timezone="Europe/London",
        )
        self.assertEqual(block.timezone, "Europe/London")

    def test_completed_at_defaults_to_none(self):
        """Tests that completed_at is None by default when a TimeBlock is created."""
        block = TimeBlock.objects.create(
            day=self.day_plan,
            block_type="lecture",
            start_time=time(9, 0),
            end_time=time(10, 0),
        )
        self.assertIsNone(block.completed_at)

    def test_completed_at_can_be_set(self):
        """Tests that completed_at can be set to mark a TimeBlock as completed."""
        now = timezone.now()
        block = TimeBlock.objects.create(
            day=self.day_plan,
            block_type="lecture",
            start_time=time(9, 0),
            end_time=time(10, 0),
            completed_at=now,
        )
        self.assertEqual(block.completed_at, now)

    def test_pinned_defaults_to_false(self):
        """Tests that pinned is False by default when a TimeBlock is created."""
        block = TimeBlock.objects.create(
            day=self.day_plan,
            block_type="lecture",
            start_time=time(9, 0),
            end_time=time(10, 0),
        )
        self.assertFalse(block.pinned)

    def test_pinned_at_defaults_to_none(self):
        """Tests that pinned_at is None by default when a TimeBlock is created."""
        block = TimeBlock.objects.create(
            day=self.day_plan,
            block_type="lecture",
            start_time=time(9, 0),
            end_time=time(10, 0),
        )
        self.assertIsNone(block.pinned_at)

    def test_can_pin_time_block(self):
        """Tests that a TimeBlock can be pinned by setting pinned to True and pinned_at to a timestamp."""
        now = timezone.now()
        block = TimeBlock.objects.create(
            day=self.day_plan,
            block_type="lecture",
            start_time=time(9, 0),
            end_time=time(10, 0),
            pinned=True,
            pinned_at=now,
        )
        self.assertTrue(block.pinned)
        self.assertEqual(block.pinned_at, now)
