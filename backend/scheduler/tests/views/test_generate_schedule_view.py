from unittest.mock import MagicMock, patch
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient

User = get_user_model()


class GenerateScheduleViewTests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="testpass")
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        self.url = reverse("schedule-generate")
        self.valid_payload = {"week_start": "2024-01-01", "week_end": "2024-01-07"}

    def test_unauthenticated_request_returns_401(self):
        self.client.force_authenticate(user=None)
        response = self.client.post(self.url, self.valid_payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    @patch("scheduler.views.generator_view.GenerateScheduleRequestSerializer")
    def test_invalid_data_returns_400(self, MockSerializer):
        mock_serializer = MagicMock()
        mock_serializer.is_valid.return_value = False
        mock_serializer.errors = {"week_start": ["This field is required."]}
        MockSerializer.return_value = mock_serializer

        response = self.client.post(self.url, {}, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @patch("scheduler.views.generator_view.GenerateScheduleRequestSerializer")
    def test_invalid_data_returns_serializer_errors_in_body(self, MockSerializer):
        errors = {"week_start": ["This field is required."]}
        mock_serializer = MagicMock()
        mock_serializer.is_valid.return_value = False
        mock_serializer.errors = errors
        MockSerializer.return_value = mock_serializer

        response = self.client.post(self.url, {}, format="json")

        self.assertEqual(response.data, errors)

    @patch("scheduler.views.generator_view.GenerateScheduleRequestSerializer")
    def test_service_not_called_when_serializer_invalid(self, MockSerializer):
        mock_serializer = MagicMock()
        mock_serializer.is_valid.return_value = False
        mock_serializer.errors = {}
        MockSerializer.return_value = mock_serializer

        with patch("scheduler.views.generator_view.ScheduleService") as MockService:
            self.client.post(self.url, {}, format="json")
            MockService.return_value.generate.assert_not_called()

    @patch("scheduler.views.generator_view.ScheduleService")
    @patch("scheduler.views.generator_view.GenerateScheduleRequestSerializer")
    def test_valid_request_returns_200(self, MockSerializer, MockService):
        mock_serializer = MagicMock()
        mock_serializer.is_valid.return_value = True
        mock_serializer.validated_data = self.valid_payload
        MockSerializer.return_value = mock_serializer

        MockService.return_value.generate.return_value = {"slots": []}

        response = self.client.post(self.url, self.valid_payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    @patch("scheduler.views.generator_view.ScheduleService")
    @patch("scheduler.views.generator_view.GenerateScheduleRequestSerializer")
    def test_response_body_matches_service_output(self, MockSerializer, MockService):
        mock_serializer = MagicMock()
        mock_serializer.is_valid.return_value = True
        mock_serializer.validated_data = self.valid_payload
        MockSerializer.return_value = mock_serializer

        fake_payload = {"slots": [{"day": 0, "start": 540, "end": 600}]}
        MockService.return_value.generate.return_value = fake_payload

        response = self.client.post(self.url, self.valid_payload, format="json")

        self.assertEqual(response.data, fake_payload)

    @patch("scheduler.views.generator_view.ScheduleService")
    @patch("scheduler.views.generator_view.GenerateScheduleRequestSerializer")
    def test_service_called_with_request_user_and_validated_data(self, MockSerializer, MockService):
        validated = {**self.valid_payload}
        mock_serializer = MagicMock()
        mock_serializer.is_valid.return_value = True
        mock_serializer.validated_data = validated
        MockSerializer.return_value = mock_serializer

        MockService.return_value.generate.return_value = {}

        self.client.post(self.url, self.valid_payload, format="json")

        MockService.return_value.generate.assert_called_once_with(self.user, validated)