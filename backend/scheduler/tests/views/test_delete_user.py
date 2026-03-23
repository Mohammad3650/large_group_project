from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class DeleteUserViewTestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="test@example.com",
            username="testuser",
            first_name="Test",
            last_name="User",
            phone_number="07123456789",
            password="Password123!",
        )

    def test_authenticated_user_can_delete_their_account(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.delete(reverse("delete_user"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "Account deleted")
        self.assertFalse(User.objects.filter(pk=self.user.pk).exists())

    def test_unauthenticated_user_cannot_delete_account(self):
        response = self.client.delete(reverse("delete_user"))

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)