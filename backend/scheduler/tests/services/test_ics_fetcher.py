from django.test import TestCase
from rest_framework import serializers

from scheduler.services.ics_fetcher import (
    fetch_ics_content,
    normalise_subscription_url,
)


class NormaliseSubscriptionUrlTest(TestCase):
    def test_normalise_subscription_url_accepts_https(self):
        """It should accept a valid https subscription URL."""
        url = normalise_subscription_url("https://example.com/calendar.ics")
        self.assertEqual(url, "https://example.com/calendar.ics")

    def test_normalise_subscription_url_strips_whitespace(self):
        """It should strip surrounding whitespace from the URL."""
        url = normalise_subscription_url("  https://example.com/calendar.ics  ")
        self.assertEqual(url, "https://example.com/calendar.ics")

    def test_normalise_subscription_url_converts_webcal_to_https(self):
        """It should convert a webcal URL to https."""
        url = normalise_subscription_url("webcal://example.com/calendar.ics")
        self.assertEqual(url, "https://example.com/calendar.ics")

    def test_normalise_subscription_url_rejects_blank_value(self):
        """It should reject a blank subscription URL."""
        with self.assertRaises(serializers.ValidationError) as context:
            normalise_subscription_url("   ")

        self.assertEqual(
            context.exception.detail["source_url"][0],
            "A calendar URL must be provided.",
        )

    def test_normalise_subscription_url_rejects_invalid_scheme(self):
        """It should reject an unsupported URL scheme."""
        with self.assertRaises(serializers.ValidationError) as context:
            normalise_subscription_url("ftp://example.com/calendar.ics")

        self.assertEqual(
            context.exception.detail["source_url"][0],
            "Only http, https, or webcal calendar URLs are supported.",
        )

    def test_normalise_subscription_url_rejects_missing_netloc(self):
        """It should reject a URL without a valid host."""
        with self.assertRaises(serializers.ValidationError) as context:
            normalise_subscription_url("https:///calendar.ics")

        self.assertEqual(
            context.exception.detail["source_url"][0],
            "A valid calendar URL must be provided.",
        )


class FetchIcsContentSmokeTest(TestCase):
    def test_fetch_ics_content_exists(self):
        """It should expose the fetch_ics_content function."""
        self.assertTrue(callable(fetch_ics_content))