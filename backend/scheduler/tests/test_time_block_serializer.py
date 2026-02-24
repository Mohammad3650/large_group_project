from django.test import TestCase
from ..serializer.time_block_serializer import TimeBlockSerializer


class TimeBlockSerializerTest(TestCase):

    def test_valid_data_with_description(self):
        data = {
            "date": "2026-02-18",
            "location": "Library",
            "start_time": "09:00",
            "end_time": "10:00",
            "block_type": "study",
            "description": "Work on coursework",
        }
        serializer = TimeBlockSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_valid_data_without_description(self):
        data = {
            "date": "2026-02-18",
            "start_time": "09:00",
            "end_time": "10:00",
            "block_type": "study",
            "location": "Library",
            "description": "", 
        }

        serializer = TimeBlockSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_invalid_time_order(self):
        data = {
            "date": "2026-02-18",
            "start_time": "10:00",
            "end_time": "09:00",
            "block_type": "study",
            "location": "Library",
            "description": "Invalid time test",
        }

        serializer = TimeBlockSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("non_field_errors", serializer.errors)


    def test_missing_required_field(self):
        data = {
            "date": "2026-02-18",
            # missing start_time
            "end_time": "10:00",
            "block_type": "study",
            "location": "Library",
            "description": "Missing start time",
        }

        serializer = TimeBlockSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("start_time", serializer.errors)
    
