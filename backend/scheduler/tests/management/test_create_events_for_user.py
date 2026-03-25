from django.test import TestCase
from django.contrib.auth import get_user_model
from scheduler.management.commands.seed import create_events_for_user
from scheduler.management.commands.seed_config import SEEDED_USER_PREFIX, NUM_EVENTS_PER_USER, EVENTS
from scheduler.models.DayPlan import DayPlan
from scheduler.models.TimeBlock import TimeBlock

User = get_user_model()


class CreateEventsForUserTest(TestCase):

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
        """Tests that the correct number of time blocks are created."""
        create_events_for_user(self.user, NUM_EVENTS_PER_USER)
        self.assertEqual(TimeBlock.objects.filter(day__user=self.user).count(), NUM_EVENTS_PER_USER)

    def test_creates_day_plans(self):
        """Tests that day plans are created for the user."""
        create_events_for_user(self.user, NUM_EVENTS_PER_USER)
        self.assertGreater(DayPlan.objects.filter(user=self.user).count(), 0)

    def test_time_blocks_have_correct_timezone(self):
        """Tests that all time blocks are created with the correct timezone."""
        create_events_for_user(self.user, NUM_EVENTS_PER_USER)
        blocks = TimeBlock.objects.filter(day__user=self.user)
        for block in blocks:
            self.assertEqual(block.timezone, "Europe/London")

    def test_time_blocks_match_events_config(self):
        """Tests that the first time block matches the first event in the config."""
        create_events_for_user(self.user, NUM_EVENTS_PER_USER)
        first_block = TimeBlock.objects.filter(day__user=self.user).order_by("id").first()
        self.assertEqual(first_block.name, EVENTS[0]["name"])
        self.assertEqual(first_block.block_type, EVENTS[0]["block_type"])

    def test_does_not_create_duplicate_day_plans(self):
        """Tests that multiple events on the same date share a single day plan."""
        create_events_for_user(self.user, NUM_EVENTS_PER_USER)
        blocks = TimeBlock.objects.filter(day__user=self.user)
        day_plan_ids = set(block.day_id for block in blocks)
        self.assertEqual(DayPlan.objects.filter(user=self.user).count(), len(day_plan_ids))
