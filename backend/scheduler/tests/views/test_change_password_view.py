from django.test import TestCase
from rest_framework.test import APIClient

from scheduler.models.User import User


class ChangePasswordViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="passworduser",
            email="passworduser@example.com",
            password="oldpassword123",
        )
        self.url = "/api/user/change-password/"

    def test_change_password_requires_authentication(self):
        response = self.client.post(
            self.url,
            {
                "current_password": "oldpassword123",
                "new_password": "newpassword123",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 401)

    def test_change_password_success(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            self.url,
            {
                "current_password": "oldpassword123",
                "new_password": "newpassword123",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["message"], "Password updated successfully")

        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("newpassword123"))
        self.assertFalse(self.user.check_password("oldpassword123"))

    def test_change_password_fails_with_incorrect_current_password(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            self.url,
            {
                "current_password": "wrongpassword",
                "new_password": "newpassword123",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"], "Current password is incorrect")

        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("oldpassword123"))