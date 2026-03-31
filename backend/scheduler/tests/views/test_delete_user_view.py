from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class DeleteUserViewTest(APITestCase):
    def setUp(self):
        """Create a reusable user and delete endpoint URL."""
        self.user = User.objects.create_user(
            email="test@example.com",
            username="testuser",
            first_name="Test",
            last_name="User",
            phone_number="07123456789",
            password="Password123!",
        )
        self.url = reverse("delete_user_view")

    def test_authenticated_user_can_delete_their_account(self):
        """It should allow an authenticated user to delete their own account."""
        self.client.force_authenticate(user=self.user)

        response = self.client.delete(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "Account deleted")
        self.assertFalse(User.objects.filter(pk=self.user.pk).exists())

    def test_unauthenticated_user_cannot_delete_account(self):
        """It should reject unauthenticated delete requests."""
        response = self.client.delete(self.url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)