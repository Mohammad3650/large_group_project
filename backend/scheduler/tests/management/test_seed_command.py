from io import StringIO
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.management import call_command
from scheduler.management.commands.seed_config import NUM_EVENTS_PER_USER, SEEDED_USER_PREFIX, NUM_TOTAL_USERS
from scheduler.models.TimeBlock import TimeBlock
from scheduler.models.Note import Note

User = get_user_model()


class SeedCommandTest(TestCase):

    def test_seed_creates_correct_number_of_users(self):
        """Tests that the seed command creates the correct total number of users."""
        call_command("seed", stdout=StringIO())
        self.assertEqual(User.objects.filter(username__startswith=SEEDED_USER_PREFIX).count(), NUM_TOTAL_USERS)

    def test_seed_creates_johndoe(self):
        """Tests that the seed command creates the guaranteed johndoe user."""
        call_command("seed", stdout=StringIO())
        self.assertTrue(User.objects.filter(username=f"{SEEDED_USER_PREFIX}johndoe").exists())

    def test_seed_creates_time_blocks(self):
        """Tests that the seed command creates the correct number of time blocks."""
        call_command("seed", stdout=StringIO())
        self.assertEqual(TimeBlock.objects.count(), NUM_TOTAL_USERS * NUM_EVENTS_PER_USER)

    def test_seed_creates_notes(self):
        """Tests that the seed command creates notes for all users."""
        call_command("seed", stdout=StringIO())
        self.assertEqual(Note.objects.count(), NUM_TOTAL_USERS)

    def test_seed_does_not_run_if_already_seeded(self):
        """Tests that the seed command exits early if the database is already seeded."""
        call_command("seed", stdout=StringIO())
        out = StringIO()
        call_command("seed", stdout=out)
        self.assertIn("already been seeded", out.getvalue())
        self.assertEqual(User.objects.filter(username__startswith=SEEDED_USER_PREFIX).count(), NUM_TOTAL_USERS)
