from django.test import TestCase
from rest_framework import serializers

from scheduler.serializers.calendar_subscription_serializer_helpers import (
    validate_subscription_name,
    validate_subscription_source_url,
)


class CalendarSubscriptionSerializerHelpersTest(TestCase):
    def test_validate_subscription_name_strips_whitespace(self):
        """It should strip surrounding whitespace from the subscription name."""
        result = validate_subscription_name("  KCL Timetable  ")
        self.assertEqual(result, "KCL Timetable")

    def test_validate_subscription_name_rejects_blank_value(self):
        """It should reject a blank subscription name."""
        with self.assertRaises(serializers.ValidationError) as context:
            validate_subscription_name("   ")

        self.assertEqual(
            str(context.exception.detail[0]),
            "A subscription name must be provided.",
        )

    def test_validate_subscription_source_url_returns_normalised_url(self):
        """It should normalise a valid subscription source URL."""
        result = validate_subscription_source_url(
            "webcal://example.com/calendar.ics"
        )
        self.assertEqual(result, "https://example.com/calendar.ics")

    def test_validate_subscription_source_url_rejects_invalid_url(self):
        """It should reject an invalid subscription source URL."""
        with self.assertRaises(serializers.ValidationError) as context:
            validate_subscription_source_url("ftp://example.com/calendar.ics")

        self.assertEqual(
            context.exception.detail["source_url"][0],
            "Only http, https, or webcal calendar URLs are supported.",
        )