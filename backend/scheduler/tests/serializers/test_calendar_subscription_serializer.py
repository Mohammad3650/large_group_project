from django.test import TestCase

from scheduler.serializers.calendar_subscription_serializer import (
    CalendarSubscriptionSerializer,
)


class CalendarSubscriptionSerializerTest(TestCase):
    """Tests for the CalendarSubscriptionSerializer."""

    def setUp(self):
        """Create a base valid data dictionary for reuse across tests."""
        self.data = {
            "name": "KCL Timetable",
            "source_url": "https://example.com/calendar.ics",
        }

    def test_valid_data_passes(self):
        """Verify the serializer is valid and returns expected values for valid input."""
        serializer = CalendarSubscriptionSerializer(data=self.data)

        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertEqual(serializer.validated_data["name"], "KCL Timetable")
        self.assertEqual(
            serializer.validated_data["source_url"],
            "https://example.com/calendar.ics",
        )

    def test_name_is_trimmed(self):
        """Verify leading and trailing whitespace is removed from the name field."""
        self.data["name"] = "  My Calendar  "
        serializer = CalendarSubscriptionSerializer(data=self.data)

        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertEqual(serializer.validated_data["name"], "My Calendar")

    def test_blank_name_fails(self):
        """Verify the serializer rejects a blank name with the correct error message."""
        self.data["name"] = ""
        serializer = CalendarSubscriptionSerializer(data=self.data)

        self.assertFalse(serializer.is_valid())
        self.assertIn("name", serializer.errors)
        self.assertEqual(
            str(serializer.errors["name"][0]),
            "This field may not be blank.",
        )

    def test_webcal_url_is_normalised_to_https(self):
        """Verify webcal URLs are converted to https during validation."""
        self.data["source_url"] = "webcal://example.com/calendar.ics"
        serializer = CalendarSubscriptionSerializer(data=self.data)

        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertEqual(
            serializer.validated_data["source_url"],
            "https://example.com/calendar.ics",
        )

    def test_source_url_is_trimmed(self):
        """Verify leading and trailing whitespace is removed from the source_url field."""
        self.data["source_url"] = "  https://example.com/calendar.ics  "
        serializer = CalendarSubscriptionSerializer(data=self.data)

        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertEqual(
            serializer.validated_data["source_url"],
            "https://example.com/calendar.ics",
        )

    def test_blank_source_url_fails(self):
        """Verify the serializer rejects a blank source_url with the correct error message."""
        self.data["source_url"] = ""
        serializer = CalendarSubscriptionSerializer(data=self.data)

        self.assertFalse(serializer.is_valid())
        self.assertIn("source_url", serializer.errors)
        self.assertEqual(
            str(serializer.errors["source_url"][0]),
            "This field may not be blank.",
        )

    def test_invalid_scheme_fails(self):
        """Verify URLs with unsupported schemes are rejected with the correct error."""
        self.data["source_url"] = "ftp://example.com/calendar.ics"
        serializer = CalendarSubscriptionSerializer(data=self.data)

        self.assertFalse(serializer.is_valid())
        self.assertIn("source_url", serializer.errors)
        self.assertIn("source_url", serializer.errors["source_url"])
        self.assertEqual(
            str(serializer.errors["source_url"]["source_url"][0]),
            "Only http, https, or webcal calendar URLs are supported.",
        )

    def test_missing_netloc_fails(self):
        """Verify URLs without a valid network location are rejected."""
        self.data["source_url"] = "https:///calendar.ics"
        serializer = CalendarSubscriptionSerializer(data=self.data)

        self.assertFalse(serializer.is_valid())
        self.assertIn("source_url", serializer.errors)
        self.assertIn("source_url", serializer.errors["source_url"])
        self.assertEqual(
            str(serializer.errors["source_url"]["source_url"][0]),
            "A valid calendar URL must be provided.",
        )