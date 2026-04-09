from django.test import TestCase

from scheduler.serializers.calendar_subscription_serializer import (
    CalendarSubscriptionSerializer,
)


class CalendarSubscriptionSerializerTest(TestCase):
    """Tests for the CalendarSubscriptionSerializer."""

    def setUp(self):
        """Create a base valid data dictionary for reuse across tests."""
        self.valid_data = {
            "name": "KCL Timetable",
            "source_url": "https://example.com/calendar.ics",
        }

    def build_serializer(self, **overrides):
        """Build a serializer using valid base data with optional overrides."""
        data = self.valid_data.copy()
        data.update(overrides)
        return CalendarSubscriptionSerializer(data=data)

    def test_valid_data_passes(self):
        """It should accept valid serializer input."""
        serializer = self.build_serializer()

        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertEqual(serializer.validated_data["name"], "KCL Timetable")
        self.assertEqual(
            serializer.validated_data["source_url"],
            "https://example.com/calendar.ics",
        )

    def test_name_is_trimmed(self):
        """It should trim leading and trailing whitespace from the name field."""
        serializer = self.build_serializer(name="  My Calendar  ")

        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertEqual(serializer.validated_data["name"], "My Calendar")

    def test_blank_name_fails(self):
        """It should reject a blank name."""
        serializer = self.build_serializer(name="")

        self.assertFalse(serializer.is_valid())
        self.assertIn("name", serializer.errors)
        self.assertEqual(
            str(serializer.errors["name"][0]),
            "This field may not be blank.",
        )

    def test_webcal_url_is_normalised_to_https(self):
        """It should convert webcal URLs to https during validation."""
        serializer = self.build_serializer(
            source_url="webcal://example.com/calendar.ics"
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertEqual(
            serializer.validated_data["source_url"],
            "https://example.com/calendar.ics",
        )

    def test_source_url_is_trimmed(self):
        """It should trim leading and trailing whitespace from the source_url field."""
        serializer = self.build_serializer(
            source_url="  https://example.com/calendar.ics  "
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertEqual(
            serializer.validated_data["source_url"],
            "https://example.com/calendar.ics",
        )

    def test_blank_source_url_fails(self):
        """It should reject a blank source_url."""
        serializer = self.build_serializer(source_url="")

        self.assertFalse(serializer.is_valid())
        self.assertIn("source_url", serializer.errors)
        self.assertEqual(
            str(serializer.errors["source_url"][0]),
            "This field may not be blank.",
        )

    def test_invalid_scheme_fails(self):
        """It should reject URLs with unsupported schemes."""
        serializer = self.build_serializer(
            source_url="ftp://example.com/calendar.ics"
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("source_url", serializer.errors)
        self.assertIn("source_url", serializer.errors["source_url"])
        self.assertEqual(
            str(serializer.errors["source_url"]["source_url"][0]),
            "Only http, https, or webcal calendar URLs are supported.",
        )

    def test_missing_netloc_fails(self):
        """It should reject URLs without a valid network location."""
        serializer = self.build_serializer(
            source_url="https:///calendar.ics"
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("source_url", serializer.errors)
        self.assertIn("source_url", serializer.errors["source_url"])
        self.assertEqual(
            str(serializer.errors["source_url"]["source_url"][0]),
            "A valid calendar URL must be provided.",
        )