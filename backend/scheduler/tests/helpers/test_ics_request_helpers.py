from unittest.mock import Mock, patch

from django.test import TestCase

from scheduler.services.ics_request_helpers import (
    build_calendar_request,
    decode_response_content,
    get_response_charset,
    open_calendar_request,
)


class IcsRequestHelpersTest(TestCase):
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

    def test_get_response_charset_returns_response_charset(self):
        """It should return the response charset when present."""
        response = Mock()
        response.headers.get_content_charset.return_value = "utf-8"

        charset = get_response_charset(response)

        self.assertEqual(charset, "utf-8")

    def test_get_response_charset_defaults_to_utf8(self):
        """It should default to utf-8 when the response charset is missing."""
        response = Mock()
        response.headers.get_content_charset.return_value = None

        charset = get_response_charset(response)

        self.assertEqual(charset, "utf-8")

    def test_decode_response_content_uses_response_charset(self):
        """It should decode response content using the provided charset."""
        response = Mock()
        response.read.return_value = b"BEGIN:VCALENDAR"
        response.headers.get_content_charset.return_value = "utf-8"

        content = decode_response_content(response)

        self.assertEqual(content, "BEGIN:VCALENDAR")

    @patch("scheduler.services.ics_request_helpers.urlopen")
    def test_open_calendar_request_uses_timeout_of_ten_seconds(self, mock_urlopen):
        """It should open the request with the expected timeout."""
        request = Mock()

        open_calendar_request(request)

        mock_urlopen.assert_called_once_with(request, timeout=10)