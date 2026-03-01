from django.test import TestCase
from ..serializer.time_block_serializer import TimeBlockSerializer


class TimeBlockSerializerTest(TestCase):

    def test_valid_data_without_description(self):
        data = {
            "date": "2026-02-18",
            "name": "Study block",
            "start_time": "09:00",
            "end_time": "10:00",
            "block_type": "study",
            "is_fixed": True,
        }
        serializer = TimeBlockSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_valid_data_with_description(self):
        data = {
            "date": "2026-02-18",
            "name": "Study block",
            "start_time": "09:00",
            "end_time": "10:00",
            "block_type": "study",
            "description": "Revision", 
            "is_fixed": True,
        }

        serializer = TimeBlockSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_invalid_time_order(self):
        data = {
            "date": "2026-02-18",
            "name": "Study block",
            "start_time": "10:00",
            "end_time": "09:00",
            "block_type": "study",
            "is_fixed": True,
        }

        serializer = TimeBlockSerializer(data=data)
        self.assertFalse(serializer.is_valid())

    def test_missing_required_field(self):
        data = {
            "date": "2026-02-18",
            # Missing name intentionally
            "start_time": "09:00",
            "end_time": "10:00",
            "block_type": "study",
            "is_fixed": True,
        }

        serializer = TimeBlockSerializer(data=data)
        self.assertFalse(serializer.is_valid())

    def test_valid_flexible_block(self):
        data = {
            "date": "2026-02-23",
            "name": "Flexible study",
            "duration": 60,
            "time_of_day_preference": "morning",
            "block_type": "study",
            "is_fixed": False,
        }

        serializer = TimeBlockSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)    
