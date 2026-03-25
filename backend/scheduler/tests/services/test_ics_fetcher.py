from unittest.mock import Mock, patch

from django.test import TestCase
from rest_framework import serializers

from scheduler.services.ics_fetcher import (
    fetch_ics_content,
    normalise_subscription_url,
)


class NormaliseSubscriptionUrlTest(TestCase):
    def test_normalise_subscription_url_accepts_https(self):
        url = normalise_subscription_url("https://example.com/calendar.ics")
        self.assertEqual(url, "https://example.com/calendar.ics")

    def test_normalise_subscription_url_strips_whitespace(self):
        url = normalise_subscription_url("  https://example.com/calendar.ics  ")
        self.assertEqual(url, "https://example.com/calendar.ics")

    def test_normalise_subscription_url_converts_webcal_to_https(self):
        url = normalise_subscription_url("webcal://example.com/calendar.ics")
        self.assertEqual(url, "https://example.com/calendar.ics")

    def test_normalise_subscription_url_rejects_blank_value(self):
        with self.assertRaises(serializers.ValidationError) as context:
            normalise_subscription_url("   ")

        self.assertEqual(
            context.exception.detail["source_url"][0],
            "A calendar URL must be provided.",
        )

    def test_normalise_subscription_url_rejects_invalid_scheme(self):
        with self.assertRaises(serializers.ValidationError) as context:
            normalise_subscription_url("ftp://example.com/calendar.ics")

        self.assertEqual(
            context.exception.detail["source_url"][0],
            "Only http, https, or webcal calendar URLs are supported.",
        )

    def test_normalise_subscription_url_rejects_missing_netloc(self):
        with self.assertRaises(serializers.ValidationError) as context:
            normalise_subscription_url("https:///calendar.ics")

        self.assertEqual(
            context.exception.detail["source_url"][0],
            "A valid calendar URL must be provided.",
        )


class FetchIcsContentTest(TestCase):
    @patch("scheduler.services.ics_fetcher.urlopen")
    def test_fetch_ics_content_returns_decoded_text(self, mock_urlopen):
        response = Mock()
        response.read.return_value = b"BEGIN:VCALENDAR"
        response.headers.get_content_charset.return_value = "utf-8"

        mock_context_manager = Mock()
        mock_context_manager.__enter__ = Mock(return_value=response)
        mock_context_manager.__exit__ = Mock(return_value=None)
        mock_urlopen.return_value = mock_context_manager

        content = fetch_ics_content("https://example.com/calendar.ics")

        self.assertEqual(content, "BEGIN:VCALENDAR")
        request = mock_urlopen.call_args[0][0]
        self.assertEqual(request.full_url, "https://example.com/calendar.ics")
        self.assertEqual(
            request.headers["User-agent"],
            "StudySync Calendar Import/1.0",
        )

    @patch("scheduler.services.ics_fetcher.urlopen")
    def test_fetch_ics_content_uses_utf8_when_charset_missing(self, mock_urlopen):
        response = Mock()
        response.read.return_value = b"BEGIN:VCALENDAR"
        response.headers.get_content_charset.return_value = None

        mock_context_manager = Mock()
        mock_context_manager.__enter__ = Mock(return_value=response)
        mock_context_manager.__exit__ = Mock(return_value=None)
        mock_urlopen.return_value = mock_context_manager

        content = fetch_ics_content("https://example.com/calendar.ics")

        self.assertEqual(content, "BEGIN:VCALENDAR")

    @patch("scheduler.services.ics_fetcher.urlopen", side_effect=Exception("network error"))
    def test_fetch_ics_content_raises_validation_error_on_failure(self, mock_urlopen):
        with self.assertRaises(serializers.ValidationError) as context:
            fetch_ics_content("https://example.com/calendar.ics")

        self.assertEqual(
            context.exception.detail["source_url"][0],
            "Unable to fetch the calendar feed from the provided URL.",
        )