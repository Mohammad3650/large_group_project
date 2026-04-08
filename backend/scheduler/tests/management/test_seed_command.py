from io import StringIO
from unittest.mock import patch

from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.management import call_command

from scheduler.management.commands.seed_config import (
    NUM_EVENTS_PER_USER, SEEDED_USER_PREFIX, NUM_TOTAL_USERS,
    COMPLETED_EVENTS, PINNED_EVENTS,
)
from scheduler.models.TimeBlock import TimeBlock
from scheduler.models.Note import Note
from scheduler.models.CalendarSubscription import CalendarSubscription

User = get_user_model()


class SeedCommandTest(TestCase):

    @patch("scheduler.management.commands.seed.sync_calendar_subscription")
    def test_seed_creates_correct_number_of_users(self, mock_sync):
        """Tests that the seed command creates the correct total number of users."""
        call_command("seed", stdout=StringIO())
        self.assertEqual(User.objects.filter(username__startswith=SEEDED_USER_PREFIX).count(), NUM_TOTAL_USERS)

    @patch("scheduler.management.commands.seed.sync_calendar_subscription")
    def test_seed_creates_johndoe(self, mock_sync):
        """Tests that the seed command creates the guaranteed johndoe user."""
        call_command("seed", stdout=StringIO())
        self.assertTrue(User.objects.filter(username=f"{SEEDED_USER_PREFIX}johndoe").exists())

    @patch("scheduler.management.commands.seed.sync_calendar_subscription")
    def test_seed_creates_time_blocks(self, mock_sync):
        """Tests that the seed command creates the correct total number of time blocks."""
        call_command("seed", stdout=StringIO())
        expected = NUM_TOTAL_USERS * (NUM_EVENTS_PER_USER + len(COMPLETED_EVENTS) + len(PINNED_EVENTS))
        self.assertEqual(TimeBlock.objects.count(), expected)

    @patch("scheduler.management.commands.seed.sync_calendar_subscription")
    def test_seed_creates_completed_time_blocks(self, mock_sync):
        """Tests that the seed command creates completed time blocks for all users."""
        call_command("seed", stdout=StringIO())
        self.assertEqual(
            TimeBlock.objects.exclude(completed_at=None).count(),
            NUM_TOTAL_USERS * len(COMPLETED_EVENTS)
        )

    @patch("scheduler.management.commands.seed.sync_calendar_subscription")
    def test_seed_creates_pinned_time_blocks(self, mock_sync):
        """Tests that the seed command creates pinned time blocks for all users."""
        call_command("seed", stdout=StringIO())
        self.assertEqual(
            TimeBlock.objects.filter(pinned=True).count(),
            NUM_TOTAL_USERS * len(PINNED_EVENTS)
        )

    @patch("scheduler.management.commands.seed.sync_calendar_subscription")
    def test_seed_creates_notes(self, mock_sync):
        """Tests that the seed command creates notes for all users."""
        call_command("seed", stdout=StringIO())
        self.assertEqual(Note.objects.count(), NUM_TOTAL_USERS)

    @patch("scheduler.management.commands.seed.sync_calendar_subscription")
    def test_seed_creates_calendar_subscriptions(self, mock_sync):
        """Tests that the seed command creates a calendar subscription for each user."""
        call_command("seed", stdout=StringIO())
        self.assertEqual(CalendarSubscription.objects.count(), NUM_TOTAL_USERS)

    @patch("scheduler.management.commands.seed.sync_calendar_subscription")
    def test_seed_logs_warning_when_sync_fails(self, mock_sync):
        """Tests that a warning is logged when calendar subscription sync fails."""
        mock_sync.side_effect = Exception("Sync failed")
        out = StringIO()
        call_command("seed", stdout=out)
        self.assertIn("WARNING", out.getvalue())

    @patch("scheduler.management.commands.seed.sync_calendar_subscription")
    def test_seed_does_not_run_if_already_seeded(self, mock_sync):
        """Tests that the seed command exits early if the database is already seeded."""
        call_command("seed", stdout=StringIO())
        out = StringIO()
        call_command("seed", stdout=out)
        self.assertIn("already been seeded", out.getvalue())
        self.assertEqual(User.objects.filter(username__startswith=SEEDED_USER_PREFIX).count(), NUM_TOTAL_USERS)