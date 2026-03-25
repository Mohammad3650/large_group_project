from datetime import timedelta
from unittest.mock import patch

from django.test import TestCase
from django.utils import timezone

from scheduler.models.CalendarSubscription import CalendarSubscription
from scheduler.models.DayPlan import DayPlan
from scheduler.models.ImportedCalendarEvent import ImportedCalendarEvent
from scheduler.models.TimeBlock import TimeBlock
from scheduler.models.User import User
from scheduler.services.calendar_subscription_sync import (
    build_external_event_uid,
    build_timeblock_data,
    classify_block_type,
    clean_event_description,
    should_import_event,
    sync_calendar_subscription,
)


class CalendarSubscriptionSyncHelpersTest(TestCase):
    def test_classify_block_type_returns_tutorial(self):
        self.assertEqual(classify_block_type("SEG Tutorial"), "tutorial")

    def test_classify_block_type_returns_lab(self):
        self.assertEqual(classify_block_type("Physics Lab"), "lab")

    def test_classify_block_type_defaults_to_lecture(self):
        self.assertEqual(classify_block_type("Regular Lecture"), "lecture")

    def test_clean_event_description_removes_repeated_metadata_lines(self):
        description = (
            "Date: 2026-04-10\n"
            "Time: 09:00\n"
            "Location: Bush House\n"
            "Bring laptop\n"
            "Weekly assessed session\n"
        )

        cleaned = clean_event_description(description)

        self.assertEqual(cleaned, "Bring laptop\nWeekly assessed session")

    def test_clean_event_description_returns_empty_string_for_blank_value(self):
        self.assertEqual(clean_event_description(""), "")
        self.assertEqual(clean_event_description(None), "")

    def test_build_external_event_uid_uses_uid_when_present(self):
        event = {
            "uid": "external-123",
            "summary": "SEG Lecture",
            "start_datetime": timezone.now(),
            "end_datetime": timezone.now() + timedelta(hours=1),
        }

        self.assertEqual(build_external_event_uid(event), "external-123")

    def test_build_external_event_uid_builds_fallback_when_uid_missing(self):
        start_datetime = timezone.now()
        end_datetime = start_datetime + timedelta(hours=1)
        event = {
            "uid": "",
            "summary": "SEG Lecture",
            "start_datetime": start_datetime,
            "end_datetime": end_datetime,
        }

        result = build_external_event_uid(event)

        self.assertIn("SEG Lecture", result)
        self.assertIn(start_datetime.isoformat(), result)
        self.assertIn(end_datetime.isoformat(), result)

    def test_build_timeblock_data_truncates_name_and_cleans_description(self):
        start_datetime = timezone.now() + timedelta(days=2)
        end_datetime = start_datetime + timedelta(hours=2)
        event = {
            "summary": "A" * 120,
            "description": "Date: tomorrow\nReal note",
            "location": "Room 101",
            "start_datetime": start_datetime,
            "end_datetime": end_datetime,
        }

        data = build_timeblock_data(event)

        self.assertEqual(len(data["name"]), 100)
        self.assertEqual(data["location"], "Room 101")
        self.assertEqual(data["description"], "Real note")
        self.assertEqual(data["timezone"], "Europe/London")

    def test_should_import_event_returns_false_for_past_event(self):
        event = {
            "end_datetime": timezone.now() - timedelta(minutes=1),
        }

        self.assertFalse(should_import_event(event))

    def test_should_import_event_returns_true_for_future_event(self):
        event = {
            "end_datetime": timezone.now() + timedelta(minutes=1),
        }

        self.assertTrue(should_import_event(event))


class CalendarSubscriptionSyncTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="subscriptionuser",
            password="password123",
        )
        self.subscription = CalendarSubscription.objects.create(
            user=self.user,
            name="KCL Timetable",
            source_url="https://example.com/calendar.ics",
        )

    @patch("scheduler.services.calendar_subscription_sync.parse_ics_events")
    @patch("scheduler.services.calendar_subscription_sync.fetch_ics_content")
    def test_sync_calendar_subscription_creates_imported_event_and_timeblock(
        self,
        mock_fetch_ics_content,
        mock_parse_ics_events,
    ):
        start_datetime = timezone.now() + timedelta(days=7)
        end_datetime = start_datetime + timedelta(hours=1)

        mock_fetch_ics_content.return_value = "BEGIN:VCALENDAR"
        mock_parse_ics_events.return_value = [
            {
                "uid": "event-1",
                "summary": "SEG Tutorial",
                "description": "Venue: Something\nBring notes",
                "location": "Room A",
                "start_datetime": start_datetime,
                "end_datetime": end_datetime,
            }
        ]

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
        start_datetime = timezone.now() - timedelta(days=2)
        end_datetime = timezone.now() - timedelta(days=1)

        mock_fetch_ics_content.return_value = "BEGIN:VCALENDAR"
        mock_parse_ics_events.return_value = [
            {
                "uid": "past-event",
                "summary": "Old Event",
                "description": "",
                "location": "Old Room",
                "start_datetime": start_datetime,
                "end_datetime": end_datetime,
            }
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
        original_start = timezone.now() + timedelta(days=3)
        original_end = original_start + timedelta(hours=1)

        sync_calendar_subscription_event = {
            "uid": "event-2",
            "summary": "Original Lecture",
            "description": "Original description",
            "location": "Original Room",
            "start_datetime": original_start,
            "end_datetime": original_end,
        }

        with patch(
            "scheduler.services.calendar_subscription_sync.parse_ics_events",
            return_value=[sync_calendar_subscription_event],
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
            {
                "uid": "event-2",
                "summary": "Updated Lab",
                "description": "Time: 10:00\nUpdated description",
                "location": "Lab 2",
                "start_datetime": updated_start,
                "end_datetime": updated_end,
            }
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
        start_datetime = timezone.now() + timedelta(days=4)
        end_datetime = start_datetime + timedelta(hours=1)

        mock_fetch_ics_content.return_value = "BEGIN:VCALENDAR"
        mock_parse_ics_events.return_value = [
            {
                "uid": "",
                "summary": "No UID Event",
                "description": "",
                "location": "Room 5",
                "start_datetime": start_datetime,
                "end_datetime": end_datetime,
            }
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
        start_datetime = timezone.now() + timedelta(days=10)
        end_datetime = start_datetime + timedelta(hours=1)

        mock_fetch_ics_content.return_value = "BEGIN:VCALENDAR"
        mock_parse_ics_events.return_value = [
            {
                "uid": "event-dayplan",
                "summary": "Lecture",
                "description": "",
                "location": "Room X",
                "start_datetime": start_datetime,
                "end_datetime": end_datetime,
            }
        ]

        sync_calendar_subscription(self.subscription)

        self.assertEqual(DayPlan.objects.filter(user=self.user).count(), 1)