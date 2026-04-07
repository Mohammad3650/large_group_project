from datetime import date

from django.test import TestCase
from django.contrib.auth import get_user_model

from scheduler.management.commands.seed import create_pinned_events_for_user
from scheduler.management.commands.seed_config import SEEDED_USER_PREFIX, PINNED_EVENTS
from scheduler.models.DayPlan import DayPlan
from scheduler.models.TimeBlock import TimeBlock

User = get_user_model()


class CreatePinnedEventsForUserTest(TestCase):

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
        """Tests that the correct number of pinned time blocks are created."""
        create_pinned_events_for_user(self.user)
        self.assertEqual(TimeBlock.objects.filter(day__user=self.user).count(), len(PINNED_EVENTS))

    def test_all_blocks_are_pinned(self):
        """Tests that all created time blocks have pinned set to True."""
        create_pinned_events_for_user(self.user)
        blocks = TimeBlock.objects.filter(day__user=self.user)
        for block in blocks:
            self.assertTrue(block.pinned)

    def test_all_blocks_have_pinned_at_set(self):
        """Tests that all created time blocks have pinned_at set."""
        create_pinned_events_for_user(self.user)
        blocks = TimeBlock.objects.filter(day__user=self.user)
        for block in blocks:
            self.assertIsNotNone(block.pinned_at)

    def test_time_blocks_have_correct_timezone(self):
        """Tests that all pinned time blocks are created with the correct timezone."""
        create_pinned_events_for_user(self.user)
        blocks = TimeBlock.objects.filter(day__user=self.user)
        for block in blocks:
            self.assertEqual(block.timezone, "Europe/London")

    def test_time_blocks_match_pinned_events_config(self):
        """Tests that the created time blocks match the pinned events config."""
        create_pinned_events_for_user(self.user)
        first_block = TimeBlock.objects.filter(day__user=self.user).order_by("id").first()
        self.assertEqual(first_block.name, PINNED_EVENTS[0]["name"])
        self.assertEqual(first_block.block_type, PINNED_EVENTS[0]["block_type"])

    def test_creates_day_plan_for_today(self):
        """Tests that a day plan is created for today's date."""
        create_pinned_events_for_user(self.user)
        self.assertTrue(DayPlan.objects.filter(user=self.user, date=date.today()).exists())

    def test_does_not_create_duplicate_day_plans(self):
        """Tests that calling create_pinned_events_for_user twice does not create duplicate day plans."""
        create_pinned_events_for_user(self.user)
        create_pinned_events_for_user(self.user)
        self.assertEqual(DayPlan.objects.filter(user=self.user).count(), 1)
