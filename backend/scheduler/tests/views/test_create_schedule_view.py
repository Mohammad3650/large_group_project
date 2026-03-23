from django.urls import reverse
from rest_framework.test import APITestCase
from scheduler.models.User import User


class CreateScheduleTest(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            email="testuser@testuser.com",
            password="password123",
            first_name="test",
            last_name="user",
            phone_number="01122334455",
        )

    def test_create_timeblock_requires_authentication(self):
        url = reverse("api-create-timeblock")

        response = self.client.post(
            url,
            {
                "date": "2026-02-18",
                "name": "Study Session",
                "location": "Online",
                "start_time": "09:00",
                "end_time": "10:00",
                "block_type": "study",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 401)

    def test_create_timeblock_without_description(self):
        self.client.force_authenticate(user=self.user)

        url = reverse("api-create-timeblock")

        response = self.client.post(
            url,
            {
                "date": "2026-02-18",
                "name": "Study Session",
                "location": "Online",
                "start_time": "09:00",
                "end_time": "10:00",
                "block_type": "study",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)

    def test_create_timeblock_with_description(self):
        self.client.force_authenticate(user=self.user)

        url = reverse("api-create-timeblock")

        response = self.client.post(
            url,
            {
                "date": "2026-02-18",
                "name": "Study Session",
                "location": "Online",
                "start_time": "09:00",
                "end_time": "10:00",
                "block_type": "study",
                "description": "work on course work",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)

    def test_create_timeblock_missing_required_field(self):
        self.client.force_authenticate(user=self.user)

        url = reverse("api-create-timeblock")

        response = self.client.post(
            url,
            {
                "date": "2026-02-18",
                # Missing name intentionally
                "end_time": "10:00",
                "block_type": "study",
                "location": "Online",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)

    def test_create_timeblock_invalid_time_order(self):
        self.client.force_authenticate(user=self.user)
        url = reverse("api-create-timeblock")

        response = self.client.post(
            url,
            {
                "date": "2026-02-18",
                "name": "Study Session",
                "location": "Online",
                "start_time": "10:00",
                "end_time": "09:00",
                "block_type": "study",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)

    def test_create_block_missing_date_field(self):
        self.client.force_authenticate(user=self.user)

        url = reverse("api-create-timeblock")

        response = self.client.post(
            url,
            {
                "name": "No Date Block",
                "end_time": "10:00",
                "block_type": "study",
                "location": "Online",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
