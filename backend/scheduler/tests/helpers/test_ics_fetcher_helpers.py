from unittest.mock import Mock, patch

from django.test import TestCase
from rest_framework import serializers

from scheduler.services.ics_fetcher_helpers import (
    build_calendar_request,
    decode_response_content,
    normalise_source_url_value,
    open_calendar_request,
    replace_webcal_scheme,
)


class IcsFetcherHelpersTest(TestCase):
    def test_replace_webcal_scheme_converts_webcal_to_https(self):
        """It should convert a webcal URL to https."""
        result = replace_webcal_scheme("webcal://example.com/calendar.ics")
        self.assertEqual(result, "https://example.com/calendar.ics")

    def test_replace_webcal_scheme_leaves_https_unchanged(self):
        """It should leave a non-webcal URL unchanged."""
        result = replace_webcal_scheme("https://example.com/calendar.ics")
        self.assertEqual(result, "https://example.com/calendar.ics")

    def test_normalise_source_url_value_strips_whitespace(self):
        """It should strip surrounding whitespace from a source URL."""
        result = normalise_source_url_value("  https://example.com/calendar.ics  ")
        self.assertEqual(result, "https://example.com/calendar.ics")

    def test_normalise_source_url_value_rejects_blank_value(self):
        """It should reject a blank source URL."""
        with self.assertRaises(serializers.ValidationError) as context:
            normalise_source_url_value("   ")

        self.assertEqual(
            context.exception.detail["source_url"][0],
            "A calendar URL must be provided.",
        )

    def test_normalise_source_url_value_rejects_invalid_scheme(self):
        """It should reject a source URL with an unsupported scheme."""
        with self.assertRaises(serializers.ValidationError) as context:
            normalise_source_url_value("ftp://example.com/calendar.ics")

        self.assertEqual(
            context.exception.detail["source_url"][0],
            "Only http, https, or webcal calendar URLs are supported.",
        )

    def test_normalise_source_url_value_rejects_missing_host(self):
        """It should reject a source URL without a host."""
        with self.assertRaises(serializers.ValidationError) as context:
            normalise_source_url_value("https:///calendar.ics")

        self.assertEqual(
            context.exception.detail["source_url"][0],
            "A valid calendar URL must be provided.",
        )

    def test_build_calendar_request_sets_expected_headers(self):
        """It should build a calendar request with the expected headers."""
        request = build_calendar_request("https://example.com/calendar.ics")

        self.assertEqual(request.full_url, "https://example.com/calendar.ics")
        self.assertEqual(
            request.headers["User-agent"],
            "StudySync Calendar Import/1.0",
        )
        self.assertEqual(
            request.headers["Accept"],
            "text/calendar, text/plain, */*",
        )

    def test_decode_response_content_uses_response_charset(self):
        """It should decode response content using the provided charset."""
        response = Mock()
        response.read.return_value = b"BEGIN:VCALENDAR"
        response.headers.get_content_charset.return_value = "utf-8"

        content = decode_response_content(response)

        self.assertEqual(content, "BEGIN:VCALENDAR")

    def test_decode_response_content_defaults_to_utf8(self):
        """It should default to utf-8 when the response charset is missing."""
        response = Mock()
        response.read.return_value = b"BEGIN:VCALENDAR"
        response.headers.get_content_charset.return_value = None

        content = decode_response_content(response)

        self.assertEqual(content, "BEGIN:VCALENDAR")

    @patch("scheduler.services.ics_fetcher_helpers.urlopen")
    def test_open_calendar_request_uses_timeout_of_ten_seconds(self, mock_urlopen):
        """It should open the request with the expected timeout."""
        request = Mock()

        open_calendar_request(request)

        mock_urlopen.assert_called_once_with(request, timeout=10)