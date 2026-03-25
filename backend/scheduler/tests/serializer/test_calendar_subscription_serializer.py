from django.test import TestCase

from scheduler.serializer.calendar_subscription_serializer import (
    CalendarSubscriptionSerializer,
)


class CalendarSubscriptionSerializerTest(TestCase):
    def test_valid_data_passes(self):
        serializer = CalendarSubscriptionSerializer(
            data={
                "name": "KCL Timetable",
                "source_url": "https://example.com/calendar.ics",
            }
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertEqual(serializer.validated_data["name"], "KCL Timetable")
        self.assertEqual(
            serializer.validated_data["source_url"],
            "https://example.com/calendar.ics",
        )

    def test_name_is_trimmed(self):
        serializer = CalendarSubscriptionSerializer(
            data={
                "name": "  My Calendar  ",
                "source_url": "https://example.com/calendar.ics",
            }
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertEqual(serializer.validated_data["name"], "My Calendar")

    def test_blank_name_fails(self):
        serializer = CalendarSubscriptionSerializer(
            data={
                "name": "",
                "source_url": "https://example.com/calendar.ics",
            }
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("name", serializer.errors)
        self.assertEqual(
            str(serializer.errors["name"][0]),
            "This field may not be blank.",
        )

    def test_webcal_url_is_normalised_to_https(self):
        serializer = CalendarSubscriptionSerializer(
            data={
                "name": "KCL Calendar",
                "source_url": "webcal://example.com/calendar.ics",
            }
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertEqual(
            serializer.validated_data["source_url"],
            "https://example.com/calendar.ics",
        )

    def test_source_url_is_trimmed(self):
        serializer = CalendarSubscriptionSerializer(
            data={
                "name": "KCL Calendar",
                "source_url": "  https://example.com/calendar.ics  ",
            }
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertEqual(
            serializer.validated_data["source_url"],
            "https://example.com/calendar.ics",
        )

    def test_blank_source_url_fails(self):
        serializer = CalendarSubscriptionSerializer(
            data={
                "name": "KCL Calendar",
                "source_url": "",
            }
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("source_url", serializer.errors)
        self.assertEqual(
            str(serializer.errors["source_url"][0]),
            "This field may not be blank.",
        )

    def test_invalid_scheme_fails(self):
        serializer = CalendarSubscriptionSerializer(
            data={
                "name": "KCL Calendar",
                "source_url": "ftp://example.com/calendar.ics",
            }
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("source_url", serializer.errors)
        self.assertIn("source_url", serializer.errors["source_url"])
        self.assertEqual(
            str(serializer.errors["source_url"]["source_url"][0]),
            "Only http, https, or webcal calendar URLs are supported.",
        )

    def test_missing_netloc_fails(self):
        serializer = CalendarSubscriptionSerializer(
            data={
                "name": "KCL Calendar",
                "source_url": "https:///calendar.ics",
            }
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("source_url", serializer.errors)
        self.assertIn("source_url", serializer.errors["source_url"])
        self.assertEqual(
            str(serializer.errors["source_url"]["source_url"][0]),
            "A valid calendar URL must be provided.",
        )