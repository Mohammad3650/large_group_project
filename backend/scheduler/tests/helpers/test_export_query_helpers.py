from datetime import date, time

from django.test import TestCase

from scheduler.models.DayPlan import DayPlan
from scheduler.models.TimeBlock import TimeBlock
from scheduler.models.User import User
from scheduler.services.export_query_helpers import get_user_time_blocks_for_export


class ExportQueryHelpersTest(TestCase):
    def setUp(self):
        """Create reusable export query fixtures."""
        self.user = User.objects.create_user(
            username="exportqueryuser",
            email="exportqueryuser@example.com",
            password="password123",
        )
        self.other_user = User.objects.create_user(
            username="exportqueryotheruser",
            email="exportqueryotheruser@example.com",
            password="password123",
        )

        self.user_day_plan = DayPlan.objects.create(
            user=self.user,
            date=date(2026, 4, 10),
        )
        self.other_user_day_plan = DayPlan.objects.create(
            user=self.other_user,
            date=date(2026, 4, 11),
        )

        self.first_user_block = TimeBlock.objects.create(
            day=self.user_day_plan,
            name="Morning Lecture",
            block_type="lecture",
            start_time=time(9, 0),
            end_time=time(10, 0),
            location="Bush House",
            description="User event",
            timezone="Europe/London",
        )
        self.second_user_block = TimeBlock.objects.create(
            day=self.user_day_plan,
            name="Afternoon Study",
            block_type="study",
            start_time=time(14, 0),
            end_time=time(15, 0),
            location="Library",
            description="User event",
            timezone="Europe/London",
        )
        self.other_user_block = TimeBlock.objects.create(
            day=self.other_user_day_plan,
            name="Other User Event",
            block_type="study",
            start_time=time(12, 0),
            end_time=time(13, 0),
            location="Elsewhere",
            description="Other event",
            timezone="Europe/London",
        )

    def test_get_user_time_blocks_for_export_returns_only_users_blocks(self):
        """It should return only time blocks belonging to the given user."""
        time_blocks = list(get_user_time_blocks_for_export(self.user))

        self.assertEqual(len(time_blocks), 2)
        self.assertIn(self.first_user_block, time_blocks)
        self.assertIn(self.second_user_block, time_blocks)
        self.assertNotIn(self.other_user_block, time_blocks)

    def test_get_user_time_blocks_for_export_orders_by_date_and_start_time(self):
        """It should order exported time blocks by date and start time."""
        time_blocks = list(get_user_time_blocks_for_export(self.user))

        self.assertEqual(time_blocks[0], self.first_user_block)
        self.assertEqual(time_blocks[1], self.second_user_block)