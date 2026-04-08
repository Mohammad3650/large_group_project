from datetime import timedelta
from unittest.mock import patch

from django.test import TestCase
from django.utils import timezone

from scheduler.models.CalendarSubscription import CalendarSubscription
from scheduler.models.DayPlan import DayPlan
from scheduler.models.ImportedCalendarEvent import ImportedCalendarEvent
from scheduler.models.TimeBlock import TimeBlock
from scheduler.models.User import User
from scheduler.services.calendar_subscription_sync import sync_calendar_subscription


class CalendarSubscriptionSyncTest(TestCase):
    def setUp(self):
        """Create reusable subscription and event fixtures for sync tests."""
        self.user = User.objects.create_user(
            username="subscriptionuser",
            password="password123",
        )
        self.subscription = CalendarSubscription.objects.create(
            user=self.user,
            name="KCL Timetable",
            source_url="https://example.com/calendar.ics",
        )

        self.start_datetime = timezone.now() + timedelta(days=7)
        self.end_datetime = self.start_datetime + timedelta(hours=1)

        self.base_event = {
            "uid": "event-1",
            "summary": "SEG Tutorial",
            "description": "Venue: Something\nBring notes",
            "location": "Room A",
            "start_datetime": self.start_datetime,
            "end_datetime": self.end_datetime,
        }

    def build_event(self, **overrides):
        """Return a copy of the base event with optional overrides."""
        event = self.base_event.copy()
        event.update(overrides)
        return event

    @patch("scheduler.services.calendar_subscription_sync.parse_ics_events")
    @patch("scheduler.services.calendar_subscription_sync.fetch_ics_content")
    def test_sync_calendar_subscription_creates_imported_event_and_timeblock(
        self,
        mock_fetch_ics_content,
        mock_parse_ics_events,
    ):
        """It should create a new imported event and linked time block."""
        mock_fetch_ics_content.return_value = "BEGIN:VCALENDAR"
        mock_parse_ics_events.return_value = [self.build_event()]

        result = sync_calendar_subscription(self.subscription)

        self.assertEqual(result["created"], 1)
        self.assertEqual(result["updated"], 0)
        self.assertEqual(result["skipped"], 0)
        self.assertEqual(ImportedCalendarEvent.objects.count(), 1)
        self.assertEqual(TimeBlock.objects.count(), 1)

        imported_event = ImportedCalendarEvent.objects.get()
        time_block = imported_event.time_block

        self.assertEqual(imported_event.subscription, self.subscription)
        self.assertEqual(imported_event.external_event_uid, "event-1")
        self.assertEqual(time_block.name, "SEG Tutorial")
        self.assertEqual(time_block.block_type, "tutorial")
        self.assertEqual(time_block.location, "Room A")
        self.assertEqual(time_block.description, "Bring notes")
        self.assertEqual(time_block.timezone, "Europe/London")

        self.subscription.refresh_from_db()
        self.assertIsNotNone(self.subscription.last_synced_at)
        self.assertEqual(self.subscription.last_error, "")

    @patch("scheduler.services.calendar_subscription_sync.parse_ics_events")
    @patch("scheduler.services.calendar_subscription_sync.fetch_ics_content")
    def test_sync_calendar_subscription_skips_past_events(
        self,
        mock_fetch_ics_content,
        mock_parse_ics_events,
    ):
        """It should skip events that are already in the past."""
        mock_fetch_ics_content.return_value = "BEGIN:VCALENDAR"
        mock_parse_ics_events.return_value = [
            self.build_event(
                uid="past-event",
                summary="Old Event",
                description="",
                location="Old Room",
                start_datetime=timezone.now() - timedelta(days=2),
                end_datetime=timezone.now() - timedelta(days=1),
            )
        ]

        result = sync_calendar_subscription(self.subscription)

        self.assertEqual(result["created"], 0)
        self.assertEqual(result["updated"], 0)
        self.assertEqual(result["skipped"], 1)
        self.assertEqual(ImportedCalendarEvent.objects.count(), 0)
        self.assertEqual(TimeBlock.objects.count(), 0)

    @patch("scheduler.services.calendar_subscription_sync.parse_ics_events")
    @patch("scheduler.services.calendar_subscription_sync.fetch_ics_content")
    def test_sync_calendar_subscription_updates_existing_imported_event(
        self,
        mock_fetch_ics_content,
        mock_parse_ics_events,
    ):
        """It should update the existing imported event instead of duplicating it."""
        original_event = self.build_event(
            uid="event-2",
            summary="Original Lecture",
            description="Original description",
            location="Original Room",
            start_datetime=timezone.now() + timedelta(days=3),
            end_datetime=timezone.now() + timedelta(hours=1) + timedelta(days=3),
        )

        with patch(
            "scheduler.services.calendar_subscription_sync.parse_ics_events",
            return_value=[original_event],
        ), patch(
            "scheduler.services.calendar_subscription_sync.fetch_ics_content",
            return_value="BEGIN:VCALENDAR",
        ):
            sync_calendar_subscription(self.subscription)

        imported_event = ImportedCalendarEvent.objects.get()
        original_time_block_id = imported_event.time_block_id

        updated_start = timezone.now() + timedelta(days=5)
        updated_end = updated_start + timedelta(hours=2)

        mock_fetch_ics_content.return_value = "BEGIN:VCALENDAR"
        mock_parse_ics_events.return_value = [
            self.build_event(
                uid="event-2",
                summary="Updated Lab",
                description="Time: 10:00\nUpdated description",
                location="Lab 2",
                start_datetime=updated_start,
                end_datetime=updated_end,
            )
        ]

        result = sync_calendar_subscription(self.subscription)

        self.assertEqual(result["created"], 0)
        self.assertEqual(result["updated"], 1)
        self.assertEqual(result["skipped"], 0)
        self.assertEqual(ImportedCalendarEvent.objects.count(), 1)
        self.assertEqual(TimeBlock.objects.count(), 1)

        imported_event.refresh_from_db()
        updated_time_block = imported_event.time_block

        self.assertEqual(imported_event.time_block_id, original_time_block_id)
        self.assertEqual(updated_time_block.name, "Updated Lab")
        self.assertEqual(updated_time_block.block_type, "lab")
        self.assertEqual(updated_time_block.location, "Lab 2")
        self.assertEqual(updated_time_block.description, "Updated description")

    @patch("scheduler.services.calendar_subscription_sync.parse_ics_events")
    @patch("scheduler.services.calendar_subscription_sync.fetch_ics_content")
    def test_sync_calendar_subscription_uses_fallback_uid_when_missing(
        self,
        mock_fetch_ics_content,
        mock_parse_ics_events,
    ):
        """It should build a fallback external UID when the event has no UID."""
        mock_fetch_ics_content.return_value = "BEGIN:VCALENDAR"
        mock_parse_ics_events.return_value = [
            self.build_event(
                uid="",
                summary="No UID Event",
                description="",
                location="Room 5",
                start_datetime=timezone.now() + timedelta(days=4),
                end_datetime=timezone.now() + timedelta(days=4, hours=1),
            )
        ]

        result = sync_calendar_subscription(self.subscription)

        self.assertEqual(result["created"], 1)
        imported_event = ImportedCalendarEvent.objects.get()
        self.assertIn("No UID Event", imported_event.external_event_uid)

    @patch("scheduler.services.calendar_subscription_sync.parse_ics_events")
    @patch("scheduler.services.calendar_subscription_sync.fetch_ics_content")
    def test_sync_calendar_subscription_creates_dayplan_for_local_event_date(
        self,
        mock_fetch_ics_content,
        mock_parse_ics_events,
    ):
        """It should create a day plan for the imported event date when needed."""
        start_datetime = timezone.now() + timedelta(days=10)
        end_datetime = start_datetime + timedelta(hours=1)

        mock_fetch_ics_content.return_value = "BEGIN:VCALENDAR"
        mock_parse_ics_events.return_value = [
            self.build_event(
                uid="event-dayplan",
                summary="Lecture",
                description="",
                location="Room X",
                start_datetime=start_datetime,
                end_datetime=end_datetime,
            )
        ]

        sync_calendar_subscription(self.subscription)

        self.assertEqual(DayPlan.objects.filter(user=self.user).count(), 1)