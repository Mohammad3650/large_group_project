from django.test import TestCase
from django.contrib.auth import get_user_model
from unittest.mock import patch

from scheduler.management.commands.seed import create_calendar_subscription_for_user
from scheduler.management.commands.seed_config import SEEDED_USER_PREFIX, CALENDAR_SUBSCRIPTION
from scheduler.models.CalendarSubscription import CalendarSubscription

User = get_user_model()


class CreateCalendarSubscriptionForUserTest(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username=f"{SEEDED_USER_PREFIX}testuser",
            email="testuser@example.net",
            password="password123",
            first_name="Test",
            last_name="User",
            phone_number="07700900000",
        )

    @patch("scheduler.management.commands.seed.sync_calendar_subscription")
    def test_creates_subscription_for_user(self, mock_sync):
        """Tests that a calendar subscription is created for the user."""
        create_calendar_subscription_for_user(self.user)
        self.assertTrue(CalendarSubscription.objects.filter(user=self.user).exists())

    @patch("scheduler.management.commands.seed.sync_calendar_subscription")
    def test_subscription_has_correct_source_url(self, mock_sync):
        """Tests that the created subscription has the correct source URL."""
        create_calendar_subscription_for_user(self.user)
        subscription = CalendarSubscription.objects.get(user=self.user)
        self.assertEqual(subscription.source_url, CALENDAR_SUBSCRIPTION["source_url"])

    @patch("scheduler.management.commands.seed.sync_calendar_subscription")
    def test_subscription_has_correct_name(self, mock_sync):
        """Tests that the created subscription has the correct name."""
        create_calendar_subscription_for_user(self.user)
        subscription = CalendarSubscription.objects.get(user=self.user)
        self.assertEqual(subscription.name, CALENDAR_SUBSCRIPTION["name"])

    @patch("scheduler.management.commands.seed.sync_calendar_subscription")
    def test_does_not_create_duplicate_subscriptions(self, mock_sync):
        """Tests that calling create_calendar_subscription_for_user twice does not create duplicate subscriptions."""
        create_calendar_subscription_for_user(self.user)
        create_calendar_subscription_for_user(self.user)
        self.assertEqual(CalendarSubscription.objects.filter(user=self.user).count(), 1)

    @patch("scheduler.management.commands.seed.sync_calendar_subscription")
    def test_syncs_subscription_after_creation(self, mock_sync):
        """Tests that sync_calendar_subscription is called once after the subscription is created."""
        create_calendar_subscription_for_user(self.user)
        mock_sync.assert_called_once()
