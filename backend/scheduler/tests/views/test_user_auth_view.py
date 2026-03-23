from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class UserRegistrationViewTestCase(APITestCase):
    def test_user_can_register_and_receive_tokens(self):
        payload = {
            "email": "test@example.com",
            "username": "testuser",
            "first_name": "Test",
            "last_name": "User",
            "phone_number": "07123456789",
            "password": "Password123!",
        }

        response = self.client.post(reverse("signup"), payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertIn("user", response.data)
        self.assertEqual(response.data["user"]["email"], "test@example.com")
        self.assertTrue(User.objects.filter(email="test@example.com").exists())

    def test_registration_rejects_duplicate_email(self):
        User.objects.create_user(
            email="test@example.com",
            username="existing",
            first_name="Existing",
            last_name="User",
            phone_number="07123456780",
            password="Password123!",
        )

        payload = {
            "email": "test@example.com",
            "username": "newuser",
            "first_name": "New",
            "last_name": "User",
            "phone_number": "07123456789",
            "password": "Password123!",
        }

        response = self.client.post(reverse("signup"), payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data)


class UserDetailsViewTestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="test@example.com",
            username="testuser",
            first_name="Test",
            last_name="User",
            phone_number="07123456789",
            password="Password123!",
        )

    def test_authenticated_user_can_retrieve_their_details(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.get(reverse("user_details"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], self.user.email)
        self.assertEqual(response.data["username"], self.user.username)

    def test_authenticated_user_can_update_their_details(self):
        self.client.force_authenticate(user=self.user)

        payload = {
            "email": "updated@example.com",
            "username": "updateduser",
            "first_name": "Updated",
            "last_name": "User",
            "phone_number": "07123456789",
        }

        response = self.client.put(reverse("user_details"), payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.email, "updated@example.com")
        self.assertEqual(self.user.username, "updateduser")

    def test_unauthenticated_user_cannot_access_user_details(self):
        response = self.client.get(reverse("user_details"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class DashboardViewTestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="test@example.com",
            username="testuser",
            first_name="Test",
            last_name="User",
            phone_number="07123456789",
            password="Password123!",
        )

    def test_authenticated_user_can_access_dashboard(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.get(reverse("dashboard"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data["message"],
            f"Welcome to your dashboard, {self.user.username}!",
        )

    def test_unauthenticated_user_cannot_access_dashboard(self):
        response = self.client.get(reverse("dashboard"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)