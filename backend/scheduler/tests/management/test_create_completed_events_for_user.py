from datetime import date

from django.test import TestCase
from django.contrib.auth import get_user_model

from scheduler.management.commands.seed import create_completed_events_for_user
from scheduler.management.commands.seed_config import SEEDED_USER_PREFIX, COMPLETED_EVENTS
from scheduler.models.DayPlan import DayPlan
from scheduler.models.TimeBlock import TimeBlock

User = get_user_model()


class CreateCompletedEventsForUserTest(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username=f"{SEEDED_USER_PREFIX}testuser",
            email="testuser@example.net",
            password="password123",
            first_name="Test",
            last_name="User",
            phone_number="07700900000",
        )

    def test_creates_correct_number_of_time_blocks(self):
        """Tests that the correct number of completed time blocks are created."""
        create_completed_events_for_user(self.user)
        self.assertEqual(TimeBlock.objects.filter(day__user=self.user).count(), len(COMPLETED_EVENTS))

    def test_all_blocks_have_completed_at_set(self):
        """Tests that all created time blocks have completed_at set."""
        create_completed_events_for_user(self.user)
        blocks = TimeBlock.objects.filter(day__user=self.user)
        for block in blocks:
            self.assertIsNotNone(block.completed_at)

    def test_time_blocks_have_correct_timezone(self):
        """Tests that all completed time blocks are created with the correct timezone."""
        create_completed_events_for_user(self.user)
        blocks = TimeBlock.objects.filter(day__user=self.user)
        for block in blocks:
            self.assertEqual(block.timezone, "Europe/London")

    def test_time_blocks_match_completed_events_config(self):
        """Tests that the created time blocks match the completed events config."""
        create_completed_events_for_user(self.user)
        first_block = TimeBlock.objects.filter(day__user=self.user).order_by("id").first()
        self.assertEqual(first_block.name, COMPLETED_EVENTS[0]["name"])
        self.assertEqual(first_block.block_type, COMPLETED_EVENTS[0]["block_type"])

    def test_creates_day_plan_for_today(self):
        """Tests that a day plan is created for today's date."""
        create_completed_events_for_user(self.user)
        self.assertTrue(DayPlan.objects.filter(user=self.user, date=date.today()).exists())

    def test_does_not_create_duplicate_day_plans(self):
        """Tests that calling create_completed_events_for_user twice does not create duplicate day plans."""
        create_completed_events_for_user(self.user)
        create_completed_events_for_user(self.user)
        self.assertEqual(DayPlan.objects.filter(user=self.user).count(), 1)
