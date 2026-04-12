from django.test import TestCase

from scheduler.models.CalendarSubscription import CalendarSubscription
from scheduler.models.User import User
from scheduler.services.calendar_subscription_query_helpers import (
    get_user_subscriptions,
)


class CalendarSubscriptionQueryHelpersTest(TestCase):
    def setUp(self):
        """Create reusable users and subscriptions for query helper tests."""
        self.user = User.objects.create_user(
            username="subscriptionqueryuser",
            email="subscriptionqueryuser@example.com",
            password="password123",
        )
        self.other_user = User.objects.create_user(
            username="subscriptionqueryother",
            email="subscriptionqueryother@example.com",
            password="password123",
        )

        self.first_subscription = CalendarSubscription.objects.create(
            user=self.user,
            name="First Calendar",
            source_url="https://example.com/first.ics",
        )
        self.second_subscription = CalendarSubscription.objects.create(
            user=self.user,
            name="Second Calendar",
            source_url="https://example.com/second.ics",
        )
        self.other_subscription = CalendarSubscription.objects.create(
            user=self.other_user,
            name="Other User Calendar",
            source_url="https://example.com/other.ics",
        )

    def test_get_user_subscriptions_returns_only_users_subscriptions(self):
        """It should return subscriptions belonging only to the given user."""
        subscriptions = list(get_user_subscriptions(self.user))

        self.assertEqual(len(subscriptions), 2)
        self.assertIn(self.first_subscription, subscriptions)
        self.assertIn(self.second_subscription, subscriptions)
        self.assertNotIn(self.other_subscription, subscriptions)