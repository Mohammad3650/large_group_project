from datetime import date, time
from unittest.mock import patch

from django.urls import reverse
from rest_framework.test import APITestCase

from scheduler.models.CalendarSubscription import CalendarSubscription
from scheduler.models.DayPlan import DayPlan
from scheduler.models.ImportedCalendarEvent import ImportedCalendarEvent
from scheduler.models.TimeBlock import TimeBlock
from scheduler.models.User import User


class CalendarSubscriptionViewTest(APITestCase):
    def setUp(self):
        """Create reusable users, URLs, and time block fixture data."""
        self.user = User.objects.create_user(
            username="subscriptionuser",
            email="subscriptionuser@example.com",
            password="password123",
            first_name="Test",
            last_name="User",
            phone_number="07700900000",
        )
        self.other_user = User.objects.create_user(
            username="otheruser",
            email="otheruser@example.com",
            password="password123",
            first_name="Other",
            last_name="User",
            phone_number="07700900001",
        )

        self.list_create_url = reverse("api-calendar-subscriptions")
        self.refresh_url_name = "api-refresh-calendar-subscription"
        self.delete_url_name = "api-delete-calendar-subscription"

        self.base_timeblock_data = {
            "name": "Imported Lecture",
            "block_type": "lecture",
            "start_time": time(9, 0),
            "end_time": time(10, 0),
            "location": "Bush House",
            "description": "Imported from ICS",
            "timezone": "Europe/London",
        }

    def get_refresh_url(self, subscription_id):
        """Build the refresh endpoint URL for a subscription."""
        return reverse(
            self.refresh_url_name,
            kwargs={"subscription_id": subscription_id},
        )

    def get_delete_url(self, subscription_id):
        """Build the delete endpoint URL for a subscription."""
        return reverse(
            self.delete_url_name,
            kwargs={"subscription_id": subscription_id},
        )

    def create_time_block(self, day_plan, **overrides):
        """Create a time block from the shared base fixture."""
        data = self.base_timeblock_data.copy()
        data.update(overrides)
        return TimeBlock.objects.create(day=day_plan, **data)

    def test_list_subscriptions_requires_authentication(self):
        """It should require authentication to list subscriptions."""
        response = self.client.get(self.list_create_url)
        self.assertEqual(response.status_code, 401)

    def test_create_subscription_requires_authentication(self):
        """It should require authentication to create subscriptions."""
        response = self.client.post(
            self.list_create_url,
            {
                "name": "KCL Timetable",
                "source_url": "https://example.com/calendar.ics",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 401)

    def test_list_subscriptions_returns_only_authenticated_users_subscriptions(self):
        """It should only return subscriptions belonging to the logged-in user."""
        first_subscription = CalendarSubscription.objects.create(
            user=self.user,
            name="First Calendar",
            source_url="https://example.com/first.ics",
        )
        second_subscription = CalendarSubscription.objects.create(
            user=self.user,
            name="Second Calendar",
            source_url="https://example.com/second.ics",
        )
        CalendarSubscription.objects.create(
            user=self.other_user,
            name="Other User Calendar",
            source_url="https://example.com/other.ics",
        )

        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.list_create_url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)

        returned_ids = [item["id"] for item in response.data]
        returned_names = [item["name"] for item in response.data]

        self.assertIn(first_subscription.id, returned_ids)
        self.assertIn(second_subscription.id, returned_ids)
        self.assertIn("First Calendar", returned_names)
        self.assertIn("Second Calendar", returned_names)
        self.assertNotIn("Other User Calendar", returned_names)

    @patch("scheduler.views.calendar_subscription_view.sync_calendar_subscription")
    def test_create_subscription_success(self, mock_sync_calendar_subscription):
        """It should create and immediately sync a valid subscription."""
        mock_sync_calendar_subscription.return_value = {
            "created": 2,
            "updated": 0,
            "skipped": 1,
        }

        self.client.force_authenticate(user=self.user)
        response = self.client.post(
            self.list_create_url,
            {
                "name": "  KCL Timetable  ",
                "source_url": "webcal://example.com/calendar.ics",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(CalendarSubscription.objects.count(), 1)

        subscription = CalendarSubscription.objects.get()
        self.assertEqual(subscription.user, self.user)
        self.assertEqual(subscription.name, "KCL Timetable")
        self.assertEqual(subscription.source_url, "https://example.com/calendar.ics")

        self.assertEqual(
            response.data["message"],
            "Calendar subscription imported successfully.",
        )
        self.assertEqual(response.data["sync_result"]["created"], 2)
        self.assertEqual(response.data["subscription"]["name"], "KCL Timetable")

        mock_sync_calendar_subscription.assert_called_once_with(subscription)

    @patch("scheduler.views.calendar_subscription_view.sync_calendar_subscription")
    def test_create_subscription_rejects_duplicate_url_for_same_user(
        self,
        mock_sync_calendar_subscription,
    ):
        """It should reject duplicate calendar URLs for the same user."""
        CalendarSubscription.objects.create(
            user=self.user,
            name="Existing Calendar",
            source_url="https://example.com/calendar.ics",
        )

        self.client.force_authenticate(user=self.user)
        response = self.client.post(
            self.list_create_url,
            {
                "name": "Duplicate Calendar",
                "source_url": "https://example.com/calendar.ics",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("source_url", response.data)
        self.assertEqual(
            response.data["source_url"][0],
            "You have already added this calendar subscription.",
        )
        mock_sync_calendar_subscription.assert_not_called()

    @patch("scheduler.views.calendar_subscription_view.sync_calendar_subscription")
    def test_create_subscription_allows_same_url_for_different_user(
        self,
        mock_sync_calendar_subscription,
    ):
        """It should allow different users to use the same source URL."""
        CalendarSubscription.objects.create(
            user=self.other_user,
            name="Other User Calendar",
            source_url="https://example.com/calendar.ics",
        )
        mock_sync_calendar_subscription.return_value = {
            "created": 1,
            "updated": 0,
            "skipped": 0,
        }

        self.client.force_authenticate(user=self.user)
        response = self.client.post(
            self.list_create_url,
            {
                "name": "My Calendar",
                "source_url": "https://example.com/calendar.ics",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(
            CalendarSubscription.objects.filter(
                source_url="https://example.com/calendar.ics"
            ).count(),
            2,
        )

    def test_create_subscription_with_invalid_url_fails(self):
        """It should return a validation error for an invalid source URL."""
        self.client.force_authenticate(user=self.user)
        response = self.client.post(
            self.list_create_url,
            {
                "name": "Bad Calendar",
                "source_url": "ftp://example.com/calendar.ics",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("source_url", response.data)

    def test_refresh_subscription_requires_authentication(self):
        """It should require authentication to refresh a subscription."""
        subscription = CalendarSubscription.objects.create(
            user=self.user,
            name="KCL Timetable",
            source_url="https://example.com/calendar.ics",
        )

        response = self.client.post(self.get_refresh_url(subscription.id))
        self.assertEqual(response.status_code, 401)

    @patch("scheduler.views.calendar_subscription_view.sync_calendar_subscription")
    def test_refresh_subscription_success(self, mock_sync_calendar_subscription):
        """It should refresh a subscription owned by the authenticated user."""
        subscription = CalendarSubscription.objects.create(
            user=self.user,
            name="KCL Timetable",
            source_url="https://example.com/calendar.ics",
        )
        mock_sync_calendar_subscription.return_value = {
            "created": 0,
            "updated": 2,
            "skipped": 1,
        }

        self.client.force_authenticate(user=self.user)
        response = self.client.post(self.get_refresh_url(subscription.id))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.data["message"],
            "Calendar subscription refreshed successfully.",
        )
        self.assertEqual(response.data["subscription"]["id"], subscription.id)
        self.assertEqual(response.data["sync_result"]["updated"], 2)
        mock_sync_calendar_subscription.assert_called_once_with(subscription)

    def test_refresh_subscription_returns_404_for_other_users_subscription(self):
        """It should return 404 when accessing another user's subscription."""
        subscription = CalendarSubscription.objects.create(
            user=self.other_user,
            name="Other Calendar",
            source_url="https://example.com/other.ics",
        )

        self.client.force_authenticate(user=self.user)
        response = self.client.post(self.get_refresh_url(subscription.id))

        self.assertEqual(response.status_code, 404)

    def test_delete_subscription_requires_authentication(self):
        """It should require authentication to delete a subscription."""
        subscription = CalendarSubscription.objects.create(
            user=self.user,
            name="KCL Timetable",
            source_url="https://example.com/calendar.ics",
        )

        response = self.client.delete(self.get_delete_url(subscription.id))
        self.assertEqual(response.status_code, 401)

    def test_delete_subscription_deletes_imported_events_and_timeblocks(self):
        """It should delete imported events and linked user-owned time blocks."""
        subscription = CalendarSubscription.objects.create(
            user=self.user,
            name="KCL Timetable",
            source_url="https://example.com/calendar.ics",
        )
        day_plan = DayPlan.objects.create(user=self.user, date=date(2026, 4, 10))
        time_block = self.create_time_block(day_plan)
        ImportedCalendarEvent.objects.create(
            subscription=subscription,
            external_event_uid="event-123",
            time_block=time_block,
        )

        self.client.force_authenticate(user=self.user)
        response = self.client.delete(self.get_delete_url(subscription.id))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.data["message"],
            "Calendar subscription deleted successfully.",
        )
        self.assertFalse(
            CalendarSubscription.objects.filter(id=subscription.id).exists()
        )
        self.assertFalse(
            ImportedCalendarEvent.objects.filter(subscription=subscription).exists()
        )
        self.assertFalse(TimeBlock.objects.filter(id=time_block.id).exists())

    def test_delete_subscription_only_deletes_authenticated_users_timeblocks(self):
        """It should only delete imported time blocks owned by the authenticated user."""
        subscription = CalendarSubscription.objects.create(
            user=self.user,
            name="KCL Timetable",
            source_url="https://example.com/calendar.ics",
        )

        user_day_plan = DayPlan.objects.create(user=self.user, date=date(2026, 4, 10))
        other_day_plan = DayPlan.objects.create(
            user=self.other_user,
            date=date(2026, 4, 10),
        )

        user_block = self.create_time_block(
            user_day_plan,
            name="User Imported Event",
            location="Room A",
            description="User block",
        )
        other_block = self.create_time_block(
            other_day_plan,
            name="Other User Block",
            start_time=time(11, 0),
            end_time=time(12, 0),
            location="Room B",
            description="Other block",
        )

        ImportedCalendarEvent.objects.create(
            subscription=subscription,
            external_event_uid="user-event",
            time_block=user_block,
        )
        ImportedCalendarEvent.objects.create(
            subscription=subscription,
            external_event_uid="other-event",
            time_block=other_block,
        )

        self.client.force_authenticate(user=self.user)
        response = self.client.delete(self.get_delete_url(subscription.id))

        self.assertEqual(response.status_code, 200)
        self.assertFalse(TimeBlock.objects.filter(id=user_block.id).exists())
        self.assertTrue(TimeBlock.objects.filter(id=other_block.id).exists())

    def test_delete_subscription_returns_404_for_other_users_subscription(self):
        """It should return 404 when deleting another user's subscription."""
        subscription = CalendarSubscription.objects.create(
            user=self.other_user,
            name="Other Calendar",
            source_url="https://example.com/other.ics",
        )

        self.client.force_authenticate(user=self.user)
        response = self.client.delete(self.get_delete_url(subscription.id))

        self.assertEqual(response.status_code, 404)