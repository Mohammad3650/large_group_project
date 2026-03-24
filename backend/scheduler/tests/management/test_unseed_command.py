from io import StringIO
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.management import call_command
from scheduler.management.commands.seed_config import SEEDED_USER_PREFIX
from scheduler.models.TimeBlock import TimeBlock
from scheduler.models.Note import Note

User = get_user_model()


class UnseedCommandTest(TestCase):

    def test_unseed_removes_seeded_users(self):
        """Tests that the unseed command removes all seeded users."""
        call_command("seed", stdout=StringIO())
        call_command("unseed", stdout=StringIO())
        self.assertEqual(User.objects.filter(username__startswith=SEEDED_USER_PREFIX).count(), 0)

    def test_unseed_removes_time_blocks(self):
        """Tests that the unseed command removes all time blocks via cascade deletion."""
        call_command("seed", stdout=StringIO())
        call_command("unseed", stdout=StringIO())
        self.assertEqual(TimeBlock.objects.count(), 0)

    def test_unseed_removes_notes(self):
        """Tests that the unseed command removes all notes via cascade deletion."""
        call_command("seed", stdout=StringIO())
        call_command("unseed", stdout=StringIO())
        self.assertEqual(Note.objects.count(), 0)

    def test_unseed_when_nothing_seeded(self):
        """Tests that the unseed command handles the case where nothing has been seeded."""
        out = StringIO()
        call_command("unseed", stdout=out)
        self.assertIn("No seeded users found", out.getvalue())
