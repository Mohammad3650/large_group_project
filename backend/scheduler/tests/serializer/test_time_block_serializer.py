from django.test import TestCase
from scheduler.serializer.time_block_serializer import TimeBlockSerializer


class TimeBlockSerializerTest(TestCase):

    def test_valid_data_without_description(self):
        data = {
            "date": "2026-02-18",
            "name": "Study block",
            "start_time": "09:00",
            "end_time": "10:00",
            "location": "Online",
            "block_type": "study",
            "timezone": "Europe/London",
        }
        serializer = TimeBlockSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_valid_data_with_description(self):
        data = {
            "date": "2026-02-18",
            "name": "Study block",
            "start_time": "09:00",
            "end_time": "10:00",
            "location": "Online",
            "block_type": "study",
            "description": "Revision",
            "timezone": "Europe/London",
        }

        serializer = TimeBlockSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_invalid_time_order(self):
        data = {
            "date": "2026-02-18",
            "name": "Study block",
            "start_time": "10:00",
            "end_time": "09:00",
            "location": "Online",
            "block_type": "study",
        }

        serializer = TimeBlockSerializer(data=data)
        self.assertFalse(serializer.is_valid())

    def test_missing_name_field(self):
        data = {
            "date": "2026-02-18",
            # Missing name intentionally
            "start_time": "09:00",
            "end_time": "10:00",
            "location": "Online",
            "block_type": "study",
        }

        serializer = TimeBlockSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("name", serializer.errors)

    def test_missing_end_time(self):
        data = {
            "name": "Study block",
            "start_time": "09:00",
            "block_type": "study",
            "location": "Online",
        }

        serializer = TimeBlockSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("end_time", serializer.errors)

    def test_missing_start_time(self):
        data = {
            "name": "Study block",
            "end_time": "10:00",
            "block_type": "study",
            "location": "Online",
        }

        serializer = TimeBlockSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("start_time", serializer.errors)
