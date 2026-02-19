from django.test import TestCase
from ..serializer.time_block_serializer import TimeBlockSerializer


class TimeBlockSerializerTest(TestCase):

    def test_valid_data(self):
        data = {
            "date": "2026-02-18",
            "start_time": "09:00",
            "end_time": "10:00",
            "block_type": "study",
        }
        serializer = TimeBlockSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_invalid_time_order(self):
        data = {
            "date": "2026-02-18",
            "start_time": "10:00",
            "end_time": "09:00",
            "block_type": "study",
        }
        serializer = TimeBlockSerializer(data=data)
        self.assertFalse(serializer.is_valid())
