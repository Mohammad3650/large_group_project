from django.test import TestCase
from django.contrib.auth import get_user_model

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

    def test_creates_subscription_for_user(self):
        """Tests that a calendar subscription is created for the user."""
        create_calendar_subscription_for_user(self.user)
        self.assertTrue(CalendarSubscription.objects.filter(user=self.user).exists())

    def test_subscription_has_correct_source_url(self):
        """Tests that the created subscription has the correct source URL."""
        create_calendar_subscription_for_user(self.user)
        subscription = CalendarSubscription.objects.get(user=self.user)
        self.assertEqual(subscription.source_url, CALENDAR_SUBSCRIPTION["source_url"])

    def test_subscription_has_correct_name(self):
        """Tests that the created subscription has the correct name."""
        create_calendar_subscription_for_user(self.user)
        subscription = CalendarSubscription.objects.get(user=self.user)
        self.assertEqual(subscription.name, CALENDAR_SUBSCRIPTION["name"])

    def test_does_not_create_duplicate_subscriptions(self):
        """Tests that calling create_calendar_subscription_for_user twice does not create duplicate subscriptions."""
        create_calendar_subscription_for_user(self.user)
        create_calendar_subscription_for_user(self.user)
        self.assertEqual(CalendarSubscription.objects.filter(user=self.user).count(), 1)

    def test_returns_subscription_instance(self):
        """Tests that the function returns a CalendarSubscription instance."""
        subscription = create_calendar_subscription_for_user(self.user)
        self.assertIsInstance(subscription, CalendarSubscription)