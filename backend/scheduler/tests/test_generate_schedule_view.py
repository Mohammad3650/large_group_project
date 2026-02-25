from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken
from unittest.mock import patch


class GenerateScheduleViewTests(APITestCase):
    def setUp(self):
        self.url = "/api/schedule/generate/"

        # Create user + authenticate using JWT
        User = get_user_model()
        self.user = User.objects.create_user(username="testuser", password="pass12345")

        refresh = RefreshToken.for_user(self.user)
        access_token = str(refresh.access_token)

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")

    def test_get_not_allowed(self):
        res = self.client.get(self.url)
        self.assertEqual(res.status_code, 405)

    def test_post_invalid_returns_400(self):
        res = self.client.post(self.url, {"days": 7}, format="json")  # windows missing
        self.assertEqual(res.status_code, 400)
        self.assertIn("windows", res.data)

    @patch("scheduler.api.views.ScheduleService")
    def test_post_valid_returns_200_and_calls_service(self, MockService):
        MockService.return_value.generate.return_value = {"events": []}

        payload = {
            "days": 7,
            "windows": [{"start_min": 540, "end_min": 1020}],
            "scheduled": [],
            "unscheduled": [{"duration_mins": 60, "name": "Gym"}],
            "preference": "early",
        }

        res = self.client.post(self.url, payload, format="json")
        self.assertEqual(res.status_code, 200, res.data)

        MockService.return_value.generate.assert_called_once()