from django.test import TestCase
from rest_framework import serializers

from scheduler.services.ics_url_helpers import (
    normalise_source_url_value,
    replace_webcal_scheme,
)


class IcsUrlHelpersTest(TestCase):
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