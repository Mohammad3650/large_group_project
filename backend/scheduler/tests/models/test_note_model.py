from django.test import TestCase
from django.contrib.auth import get_user_model
from scheduler.models.Note import Note

User = get_user_model()


class NoteModelTest(TestCase):
    """Tests for the Note model."""

    def setUp(self):
        """Create a user and associated note for use in each test."""
        self.user = User.objects.create_user(username="testuser", password="password123", email="testuser@test.com")
        self.note = Note.objects.create(user=self.user, content="Test note content")

    def test_note_has_correct_content(self):
        """Verify the note stores the correct content."""
        self.assertEqual(self.note.content, "Test note content")

    def test_note_is_linked_to_correct_user(self):
        """Verify the note is associated with the correct user."""
        self.assertEqual(self.note.user, self.user)

    def test_note_content_can_be_blank(self):
        """Verify a note can be created with no content."""
        user2 = User.objects.create_user(username="testuser2", password="password123", email="testuser2@test.com")
        note = Note.objects.create(user=user2, content="")
        self.assertEqual(note.content, "")

    def test_updated_at_is_set_on_creation(self):
        """Verify the updated_at timestamp is set when the note is created."""
        self.assertIsNotNone(self.note.updated_at)

    def test_updated_at_changes_on_save(self):
        """Verify the updated_at timestamp changes when the note is saved."""
        original_time = self.note.updated_at
        self.note.content = "Updated content"
        self.note.save()
        self.assertGreaterEqual(self.note.updated_at, original_time)

    def test_one_to_one_relationship_with_user(self):
        """Verify a second note cannot be created for the same user."""
        from django.db import IntegrityError
        with self.assertRaises(IntegrityError):
            Note.objects.create(user=self.user, content="Duplicate note")

    def test_note_is_deleted_when_user_is_deleted(self):
        """Verify the note is deleted automatically when its user is deleted."""
        user_id = self.user.id
        self.user.delete()
        self.assertFalse(Note.objects.filter(user_id=user_id).exists())
