from django.test import TestCase
from django.contrib.auth import get_user_model
from scheduler.models.Note import Note
from scheduler.serializer.note_serializer import NoteSerializer

User = get_user_model()


class NoteSerializerTest(TestCase):
    """Tests for the NoteSerializer."""

    def setUp(self):
        """Create a user and associated note for use in each test."""
        self.user = User.objects.create_user(username="testuser", password="password123")
        self.note = Note.objects.create(user=self.user, content="Test note content")

    def test_serializer_contains_expected_fields(self):
        """Verify the serializer exposes only the content and updated_at fields."""
        serializer = NoteSerializer(self.note)
        self.assertEqual(set(serializer.data.keys()), {"content", "updated_at"})

    def test_serializer_content_field_has_correct_value(self):
        """Verify the serializer returns the correct content value."""
        serializer = NoteSerializer(self.note)
        self.assertEqual(serializer.data["content"], "Test note content")

    def test_serializer_updated_at_field_is_present(self):
        """Verify the serializer returns a non-null updated_at value."""
        serializer = NoteSerializer(self.note)
        self.assertIsNotNone(serializer.data["updated_at"])

    def test_serializer_validates_valid_data(self):
        """Verify the serializer is valid when given correct data."""
        data = {"content": "New note content"}
        serializer = NoteSerializer(data=data)
        self.assertTrue(serializer.is_valid())

    def test_serializer_allows_blank_content(self):
        """Verify the serializer accepts an empty string for content."""
        data = {"content": ""}
        serializer = NoteSerializer(data=data)
        self.assertTrue(serializer.is_valid())

    def test_serializer_updates_note_content(self):
        """Verify the serializer correctly updates the note's content on save."""
        data = {"content": "Updated content"}
        serializer = NoteSerializer(self.note, data=data)
        self.assertTrue(serializer.is_valid())
        updated_note = serializer.save()
        self.assertEqual(updated_note.content, "Updated content")

    def test_serializer_does_not_expose_user_field(self):
        """Verify the serializer does not expose the user field."""
        serializer = NoteSerializer(self.note)
        self.assertNotIn("user", serializer.data)

    def test_serializer_does_not_expose_id_field(self):
        """Verify the serializer does not expose the id field."""
        serializer = NoteSerializer(self.note)
        self.assertNotIn("id", serializer.data)
