from django.test import TestCase
from django.contrib.auth import get_user_model
from scheduler.management.commands.seed import create_note_for_user
from scheduler.management.commands.seed_config import SEEDED_USER_PREFIX
from scheduler.models.Note import Note

User = get_user_model()


class CreateNoteForUserTest(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username=f"{SEEDED_USER_PREFIX}testuser",
            email="testuser@example.net",
            password="password123",
            first_name="Test",
            last_name="User",
            phone_number="07700900000",
        )

    def test_creates_note_for_user(self):
        """Tests that a note is created for the user."""
        create_note_for_user(self.user)
        self.assertTrue(Note.objects.filter(user=self.user).exists())

    def test_note_content_contains_username(self):
        """Tests that the note content contains the username."""
        create_note_for_user(self.user)
        note = Note.objects.get(user=self.user)
        self.assertEqual(note.content, f"The notes for {self.user.username}")

    def test_does_not_create_duplicate_notes(self):
        """Tests that calling create_note_for_user twice does not create duplicate notes."""
        create_note_for_user(self.user)
        create_note_for_user(self.user)
        self.assertEqual(Note.objects.filter(user=self.user).count(), 1)
