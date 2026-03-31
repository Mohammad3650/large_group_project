from datetime import date, time

from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

from scheduler.models.DayPlan import DayPlan
from scheduler.models.TimeBlock import TimeBlock
from scheduler.models.User import User


class ExportScheduleViewTest(TestCase):
    def setUp(self):
        """Create reusable users, day plans, time blocks, and export URLs."""
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="exportuser",
            email="exportuser@example.com",
            password="password123",
        )
        self.other_user = User.objects.create_user(
            username="otheruser",
            email="otheruser@example.com",
            password="password123",
        )

        self.day_plan = DayPlan.objects.create(user=self.user, date=date(2026, 4, 10))
        self.other_day_plan = DayPlan.objects.create(
            user=self.other_user,
            date=date(2026, 4, 11),
        )

        self.user_block = TimeBlock.objects.create(
            day=self.day_plan,
            name="SEG Lecture",
            block_type="lecture",
            start_time=time(9, 0),
            end_time=time(10, 0),
            location="Bush House",
            description="Bring laptop",
            timezone="Europe/London",
        )
        self.second_user_block = TimeBlock.objects.create(
            day=self.other_day_plan,
            name="Other User Event",
            block_type="study",
            start_time=time(12, 0),
            end_time=time(13, 0),
            location="Library",
            description="Should not be exported",
            timezone="Europe/London",
        )

        self.csv_url = reverse("export_schedule_csv")
        self.ics_url = reverse("export_schedule_ics")

    def test_export_csv_requires_authentication(self):
        """It should require authentication for CSV export."""
        response = self.client.get(self.csv_url)
        self.assertEqual(response.status_code, 401)

    def test_export_csv_returns_csv_file_for_authenticated_user(self):
        """It should return a CSV file for the authenticated user."""
        self.client.force_authenticate(user=self.user)

        response = self.client.get(self.csv_url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Content-Type"], "text/csv")
        self.assertIn("studysync_schedule.csv", response["Content-Disposition"])

    def test_export_csv_contains_headers_and_only_authenticated_users_events(self):
        """It should export headers and only the authenticated user's events."""
        self.client.force_authenticate(user=self.user)

        response = self.client.get(self.csv_url)
        content = response.content.decode()

        self.assertIn("date,name,block_type,start_time,end_time,location,description", content)
        self.assertIn("2026-04-10,SEG Lecture,lecture,09:00:00,10:00:00,Bush House,Bring laptop", content)
        self.assertNotIn("Other User Event", content)

    def test_export_ics_requires_authentication(self):
        """It should require authentication for ICS export."""
        response = self.client.get(self.ics_url)
        self.assertEqual(response.status_code, 401)

    def test_export_ics_returns_calendar_file(self):
        """It should return an ICS calendar file for the authenticated user."""
        self.client.force_authenticate(user=self.user)

        response = self.client.get(self.ics_url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Content-Type"], "text/calendar")
        self.assertIn("studysync_schedule.ics", response["Content-Disposition"])

    def test_export_ics_contains_calendar_content_and_only_users_events(self):
        """It should include valid ICS content and exclude other users' events."""
        self.client.force_authenticate(user=self.user)

        response = self.client.get(self.ics_url)
        content = response.content.decode()

        expected_content = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//StudySync//Schedule Export//EN",
            "BEGIN:VEVENT",
            "SUMMARY:SEG Lecture",
            "DTSTART:20260410T090000",
            "DTEND:20260410T100000",
            "LOCATION:Bush House",
            "DESCRIPTION:Bring laptop",
        ]

        for value in expected_content:
            self.assertIn(value, content)

        self.assertNotIn("Other User Event", content)

    def test_export_ics_skips_timeblocks_without_start_or_end_time(self):
        """It should skip time blocks that do not have both start and end times."""
        TimeBlock.objects.create(
            day=self.day_plan,
            name="Untimed Event",
            block_type="study",
            start_time=None,
            end_time=time(11, 0),
            location="Online",
            description="No start time",
            timezone="Europe/London",
        )

        self.client.force_authenticate(user=self.user)

        response = self.client.get(self.ics_url)
        content = response.content.decode()

        self.assertNotIn("SUMMARY:Untimed Event", content)

    def test_export_ics_escapes_special_characters(self):
        """It should escape reserved ICS characters in exported text fields."""
        TimeBlock.objects.create(
            day=self.day_plan,
            name="Lecture, Seminar; Review",
            block_type="lecture",
            start_time=time(14, 0),
            end_time=time(15, 0),
            location="Room A, Floor 2; South Wing",
            description="Line 1\nLine 2",
            timezone="Europe/London",
        )

        self.client.force_authenticate(user=self.user)

        response = self.client.get(self.ics_url)
        content = response.content.decode()

        self.assertIn(r"SUMMARY:Lecture\, Seminar\; Review", content)
        self.assertIn(r"LOCATION:Room A\, Floor 2\; South Wing", content)
        self.assertIn(r"DESCRIPTION:Line 1\nLine 2", content)