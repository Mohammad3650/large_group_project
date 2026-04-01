from django.test import TestCase
from rest_framework import serializers

from scheduler.services.ics_fetcher import normalise_subscription_url


class NormaliseSubscriptionUrlTest(TestCase):
    def setUp(self):
        """Create reusable URL values for normalisation tests."""
        self.url = "https://example.com/calendar.ics"

    def test_normalise_subscription_url_accepts_https(self):
        """It should accept a valid HTTPS calendar URL."""
        result = normalise_subscription_url(self.url)
        self.assertEqual(result, self.url)

    def test_normalise_subscription_url_strips_whitespace(self):
        """It should strip leading and trailing whitespace from the URL."""
        result = normalise_subscription_url(f"  {self.url}  ")
        self.assertEqual(result, self.url)

    def test_normalise_subscription_url_converts_webcal_to_https(self):
        """It should convert webcal URLs to https."""
        result = normalise_subscription_url("webcal://example.com/calendar.ics")
        self.assertEqual(result, self.url)

    def test_normalise_subscription_url_rejects_blank_value(self):
        """It should reject blank source URLs."""
        with self.assertRaises(serializers.ValidationError) as context:
            normalise_subscription_url("   ")

        self.assertEqual(
            context.exception.detail["source_url"][0],
            "A calendar URL must be provided.",
        )

    def test_normalise_subscription_url_rejects_invalid_scheme(self):
        """It should reject unsupported URL schemes."""
        with self.assertRaises(serializers.ValidationError) as context:
            normalise_subscription_url("ftp://example.com/calendar.ics")

        self.assertEqual(
            context.exception.detail["source_url"][0],
            "Only http, https, or webcal calendar URLs are supported.",
        )

    def test_normalise_subscription_url_rejects_missing_netloc(self):
        """It should reject malformed URLs without a valid host."""
        with self.assertRaises(serializers.ValidationError) as context:
            normalise_subscription_url("https:///calendar.ics")

        self.assertEqual(
            context.exception.detail["source_url"][0],
            "A valid calendar URL must be provided.",
        )