from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from scheduler.models.Note import Note

User = get_user_model()


class GetNoteViewTest(TestCase):
    """Tests for the get_note view."""

    def setUp(self):
        """Create a user and API client for use in each test."""
        self.client = APIClient()
        self.user = User.objects.create_user(username="testuser", password="password123", email="testuser@test.com")
        self.client.force_authenticate(user=self.user)

    def test_get_note_returns_200(self):
        """Verify the view returns a 200 status code for an authenticated user."""
        response = self.client.get("/api/notes/get")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_note_returns_correct_content(self):
        """Verify the view returns the correct note content."""
        Note.objects.create(user=self.user, content="Test note content")
        response = self.client.get("/api/notes/get")
        self.assertEqual(response.data["content"], "Test note content")

    def test_get_note_creates_note_if_not_exists(self):
        """Verify a new empty note is created if the user does not already have one."""
        self.assertFalse(Note.objects.filter(user=self.user).exists())
        response = self.client.get("/api/notes/get")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(Note.objects.filter(user=self.user).exists())

    def test_get_note_returns_empty_content_for_new_note(self):
        """Verify a newly created note has empty content."""
        response = self.client.get("/api/notes/get")
        self.assertEqual(response.data["content"], "")

    def test_get_note_requires_authentication(self):
        """Verify the view returns a 401 status code for an unauthenticated request."""
        self.client.force_authenticate(user=None)
        response = self.client.get("/api/notes/get")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
