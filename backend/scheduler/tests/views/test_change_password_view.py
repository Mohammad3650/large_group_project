from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

from scheduler.models.User import User


class ChangePasswordViewTest(TestCase):
    def setUp(self):
        """Create a reusable user, endpoint URL, and password payload."""
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="passworduser",
            email="passworduser@example.com",
            password="oldpassword123",
        )
        self.url = reverse("change_password_view")
        self.base_payload = {
            "current_password": "oldpassword123",
            "new_password": "newpassword123",
        }

    def test_change_password_requires_authentication(self):
        """It should require authentication to change a password."""
        response = self.client.post(
            self.url,
            self.base_payload,
            format="json",
        )

        self.assertEqual(response.status_code, 401)

    def test_change_password_success(self):
        """It should update the password when the current password is correct."""
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            self.url,
            self.base_payload,
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["message"], "Password updated successfully")

        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("newpassword123"))
        self.assertFalse(self.user.check_password("oldpassword123"))

    def test_change_password_fails_with_incorrect_current_password(self):
        """It should reject the request when the current password is wrong."""
        self.client.force_authenticate(user=self.user)

        payload = self.base_payload.copy()
        payload["current_password"] = "wrongpassword"

        response = self.client.post(
            self.url,
            payload,
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"], "Current password is incorrect")

        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("oldpassword123"))