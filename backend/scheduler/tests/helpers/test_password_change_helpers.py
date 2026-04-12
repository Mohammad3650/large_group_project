from django.test import TestCase
from rest_framework import status

from scheduler.models.User import User
from scheduler.services.password_change_helpers import (
    change_user_password,
    get_password_change_data,
    has_correct_current_password,
)


class PasswordChangeHelpersTest(TestCase):
    def setUp(self):
        """Create a reusable authenticated user fixture."""
        self.user = User.objects.create_user(
            username="accountuser",
            email="accountuser@example.com",
            password="oldpassword123",
        )

    def test_get_password_change_data_returns_current_and_new_password(self):
        """It should extract the current and new password values from request data."""
        data = {
            "current_password": "oldpassword123",
            "new_password": "newpassword123",
        }

        current_password, new_password = get_password_change_data(data)

        self.assertEqual(current_password, "oldpassword123")
        self.assertEqual(new_password, "newpassword123")

    def test_has_correct_current_password_returns_true_for_matching_password(self):
        """It should return true when the provided current password is correct."""
        self.assertTrue(
            has_correct_current_password(self.user, "oldpassword123")
        )

    def test_has_correct_current_password_returns_false_for_wrong_password(self):
        """It should return false when the provided current password is incorrect."""
        self.assertFalse(
            has_correct_current_password(self.user, "wrongpassword")
        )

    def test_change_user_password_returns_error_for_incorrect_current_password(self):
        """It should return an error response payload when the current password is wrong."""
        response_data, response_status = change_user_password(
            self.user,
            {
                "current_password": "wrongpassword",
                "new_password": "newpassword123",
            },
        )

        self.assertEqual(response_status, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response_data,
            {"error": "Current password is incorrect"},
        )

        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("oldpassword123"))

    def test_change_user_password_updates_password_for_correct_current_password(self):
        """It should update the user's password when the current password is correct."""
        response_data, response_status = change_user_password(
            self.user,
            {
                "current_password": "oldpassword123",
                "new_password": "newpassword123",
            },
        )

        self.assertEqual(response_status, status.HTTP_200_OK)
        self.assertEqual(
            response_data,
            {"message": "Password updated successfully"},
        )

        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("newpassword123"))
        self.assertFalse(self.user.check_password("oldpassword123"))