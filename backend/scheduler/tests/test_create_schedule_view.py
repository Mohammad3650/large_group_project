from django.urls import reverse
from rest_framework.test import APITestCase
from scheduler.models.users import User


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

    def test_create_timeblock_without_description(self):
        self.client.force_authenticate(user=self.user)

        url = reverse("api-create-timeblock")

        response = self.client.post(
            url,
            {
                "date": "2026-02-18",
                "start_time": "09:00",
                "end_time": "10:00",
                "block_type": "study",
            },
        )

        self.assertEqual(response.status_code, 201)

    def test_create_timeblock_with_description(self):
        self.client.force_authenticate(user=self.user)

        url = reverse("api-create-timeblock")

        response = self.client.post(
            url,
            {
                "date": "2026-02-18",
                "start_time": "09:00",
                "end_time": "10:00",
                "block_type": "study",
                "description": "work on course work",
            },
        )

        self.assertEqual(response.status_code, 201)

    def test_create_timeblock_missing_required_field(self):
        self.client.force_authenticate(user=self.user)

        url = reverse("api-create-timeblock")

        response = self.client.post(
            url,
            {
                "date": "2026-02-18",
                "end_time": "10:00",
                "block_type": "study",
            },
        )

        self.assertEqual(response.status_code, 400)
