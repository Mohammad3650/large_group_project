from django.test import TestCase
from django.contrib.auth import get_user_model
from scheduler.models.Note import Note
from scheduler.serializers.note_serializer import NoteSerializer

User = get_user_model()


class NoteSerializerTest(TestCase):
    """Tests for the NoteSerializer."""

    def setUp(self):
        """Create a user, note, and serializer instances for use in each test."""
        self.user = User.objects.create_user(username="testuser", password="password123", email="testuser@test.com")
        self.note = Note.objects.create(user=self.user, content="Test note content")
        self.serializer = NoteSerializer(self.note)

    def test_serializer_contains_expected_fields(self):
        """Verify the serializer exposes only the content and updated_at fields."""
        self.assertEqual(set(self.serializer.data.keys()), {"content", "updated_at"})

    def test_serializer_content_field_has_correct_value(self):
        """Verify the serializer returns the correct content value."""
        self.assertEqual(self.serializer.data["content"], "Test note content")

    def test_serializer_updated_at_field_is_present(self):
        """Verify the serializer returns a non-null updated_at value."""
        self.assertIsNotNone(self.serializer.data["updated_at"])

    def test_serializer_validates_valid_data(self):
        """Verify the serializer is valid when given correct data."""
        serializer = NoteSerializer(data={"content": "New note content"})
        self.assertTrue(serializer.is_valid())

    def test_serializer_allows_blank_content(self):
        """Verify the serializer accepts an empty string for content."""
        serializer = NoteSerializer(data={"content": ""})
        self.assertTrue(serializer.is_valid())

    def test_serializer_updates_note_content(self):
        """Verify the serializer correctly updates the note's content on save."""
        serializer = NoteSerializer(self.note, data={"content": "Updated content"})
        self.assertTrue(serializer.is_valid())
        updated_note = serializer.save()
        self.assertEqual(updated_note.content, "Updated content")
        self.note.refresh_from_db()
        self.assertEqual(self.note.content, "Updated content")

    def test_serializer_does_not_expose_user_field(self):
        """Verify the serializer does not expose the user field."""
        self.assertNotIn("user", self.serializer.data)

    def test_serializer_does_not_expose_id_field(self):
        """Verify the serializer does not expose the id field."""
        self.assertNotIn("id", self.serializer.data)
