from unittest.mock import Mock, patch

from django.test import TestCase
from rest_framework import serializers

from scheduler.services.ics_fetcher import fetch_ics_content


class FetchIcsContentTest(TestCase):
    @patch("scheduler.services.ics_fetcher.open_calendar_request")
    def test_fetch_ics_content_returns_decoded_text(self, mock_open_calendar_request):
        """It should decode and return ICS text using the response charset."""
        response = Mock()
        response.read.return_value = b"BEGIN:VCALENDAR"
        response.headers.get_content_charset.return_value = "utf-8"

        mock_context_manager = Mock()
        mock_context_manager.__enter__ = Mock(return_value=response)
        mock_context_manager.__exit__ = Mock(return_value=None)
        mock_open_calendar_request.return_value = mock_context_manager

        content = fetch_ics_content("https://example.com/calendar.ics")

        self.assertEqual(content, "BEGIN:VCALENDAR")
        request = mock_open_calendar_request.call_args[0][0]
        self.assertEqual(request.full_url, "https://example.com/calendar.ics")
        self.assertEqual(
            request.headers["User-agent"],
            "StudySync Calendar Import/1.0",
        )

    @patch("scheduler.services.ics_fetcher.open_calendar_request")
    def test_fetch_ics_content_uses_utf8_when_charset_missing(
        self,
        mock_open_calendar_request,
    ):
        """It should fall back to UTF-8 when the charset is missing."""
        response = Mock()
        response.read.return_value = b"BEGIN:VCALENDAR"
        response.headers.get_content_charset.return_value = None

        mock_context_manager = Mock()
        mock_context_manager.__enter__ = Mock(return_value=response)
        mock_context_manager.__exit__ = Mock(return_value=None)
        mock_open_calendar_request.return_value = mock_context_manager

        content = fetch_ics_content("https://example.com/calendar.ics")

        self.assertEqual(content, "BEGIN:VCALENDAR")

    @patch(
        "scheduler.services.ics_fetcher.open_calendar_request",
        side_effect=Exception("network error"),
    )
    def test_fetch_ics_content_raises_validation_error_on_failure(
        self,
        mock_open_calendar_request,
    ):
        """It should raise a validation error when fetching fails."""
        with self.assertRaises(serializers.ValidationError) as context:
            fetch_ics_content("https://example.com/calendar.ics")

        self.assertEqual(
            context.exception.detail["source_url"][0],
            "Unable to fetch the calendar feed from the provided URL.",
        )