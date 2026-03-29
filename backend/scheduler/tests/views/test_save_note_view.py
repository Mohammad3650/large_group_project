from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from scheduler.models.Note import Note
from unittest.mock import patch


User = get_user_model()


class SaveNoteViewTest(TestCase):
    """Tests for the save_note view."""

    def setUp(self):
        """Create a user and API client for use in each test."""
        self.client = APIClient()
        self.user = User.objects.create_user(username="testuser", password="password123", email="testuser@test.com")
        self.client.force_authenticate(user=self.user)
        self.url = reverse("api-save-note")

    def test_save_note_returns_200_with_valid_data(self):
        """Verify the view returns a 200 status code when valid data is provided."""
        response = self.client.put(self.url, {"content": "Updated content"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_save_note_updates_content(self):
        """Verify the view correctly updates the note's content."""
        Note.objects.create(user=self.user, content="Old content")
        response = self.client.put(self.url, {"content": "New content"}, format="json")
        self.assertEqual(response.data["content"], "New content")

    def test_save_note_creates_note_if_not_exists(self):
        """Verify a new note is created if the user does not already have one."""
        self.assertFalse(Note.objects.filter(user=self.user).exists())
        self.client.put(self.url, {"content": "New note"}, format="json")
        self.assertTrue(Note.objects.filter(user=self.user).exists())

    def test_save_note_persists_to_database(self):
        """Verify the updated content is saved to the database."""
        self.client.put(self.url, {"content": "Persisted content"}, format="json")
        note = Note.objects.get(user=self.user)
        self.assertEqual(note.content, "Persisted content")

    def test_save_note_requires_authentication(self):
        """Verify the view returns a 401 status code for an unauthenticated request."""
        self.client.force_authenticate(user=None)
        response = self.client.put(self.url, {"content": "Test"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_save_note_response_contains_expected_fields(self):
        """Verify the response contains the content and updated_at fields."""
        response = self.client.put(self.url, {"content": "Test"}, format="json")
        self.assertIn("content", response.data)
        self.assertIn("updated_at", response.data)

    @patch("scheduler.views.save_note_view.NoteSerializer")
    def test_save_note_returns_400_when_serializer_is_invalid(self, MockSerializer):
        """Verify the view returns a 400 status code when the serializer is invalid."""
        mock_instance = MockSerializer.return_value
        mock_instance.is_valid.return_value = False
        mock_instance.errors = {"content": ["This field is required."]}
        response = self.client.put(self.url, {"content": "Test"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
