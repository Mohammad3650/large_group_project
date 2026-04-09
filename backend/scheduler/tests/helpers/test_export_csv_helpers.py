from datetime import date, time

from django.test import TestCase

from scheduler.models.DayPlan import DayPlan
from scheduler.models.TimeBlock import TimeBlock
from scheduler.models.User import User
from scheduler.services.export_csv_helpers import (
    build_csv_content,
    build_csv_row,
    format_optional_time,
)


class ExportCsvHelpersTest(TestCase):
    def setUp(self):
        """Create reusable CSV export fixtures."""
        self.user = User.objects.create_user(
            username="exportcsvuser",
            email="exportcsvuser@example.com",
            password="password123",
        )
        self.day_plan = DayPlan.objects.create(
            user=self.user,
            date=date(2026, 4, 10),
        )
        self.time_block = TimeBlock.objects.create(
            day=self.day_plan,
            name="SEG Lecture",
            block_type="lecture",
            start_time=time(9, 0),
            end_time=time(10, 0),
            location="Bush House",
            description="Bring laptop",
            timezone="Europe/London",
        )

    def test_format_optional_time_returns_string_for_time_value(self):
        """It should format a time value as a string."""
        self.assertEqual(format_optional_time(time(9, 0)), "09:00:00")

    def test_format_optional_time_returns_empty_string_for_none(self):
        """It should return an empty string for a missing time value."""
        self.assertEqual(format_optional_time(None), "")

    def test_build_csv_row_returns_expected_values(self):
        """It should return the expected CSV row values for a time block."""
        row = build_csv_row(self.time_block)

        self.assertEqual(
            row,
            [
                self.day_plan.date,
                "SEG Lecture",
                "lecture",
                "09:00:00",
                "10:00:00",
                "Bush House",
                "Bring laptop",
            ],
        )

    def test_build_csv_content_includes_headers_and_time_block_row(self):
        """It should build CSV content with headers and exported rows."""
        content = build_csv_content([self.time_block])

        self.assertIn(
            "date,name,block_type,start_time,end_time,location,description",
            content,
        )
        self.assertIn(
            "2026-04-10,SEG Lecture,lecture,09:00:00,10:00:00,Bush House,Bring laptop",
            content,
        )