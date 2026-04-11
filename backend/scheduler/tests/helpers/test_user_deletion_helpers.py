from django.test import TestCase
from rest_framework import status

from scheduler.models.User import User
from scheduler.services.user_deletion_helpers import delete_authenticated_user


class UserDeletionHelpersTest(TestCase):
    def setUp(self):
        """Create a reusable authenticated user fixture."""
        self.user = User.objects.create_user(
            username="deleteuser",
            email="deleteuser@example.com",
            password="password123",
        )

    def test_delete_authenticated_user_deletes_user_and_returns_success_payload(self):
        """It should delete the authenticated user and return a success response payload."""
        user_id = self.user.id

        response_data, response_status = delete_authenticated_user(self.user)

        self.assertEqual(response_status, status.HTTP_200_OK)
        self.assertEqual(response_data, {"message": "Account deleted"})
        self.assertFalse(User.objects.filter(id=user_id).exists())