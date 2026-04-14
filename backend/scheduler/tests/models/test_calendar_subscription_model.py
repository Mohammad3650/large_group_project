from django.test import TestCase

from scheduler.models.CalendarSubscription import CalendarSubscription
from scheduler.models.User import User


class CalendarSubscriptionModelTest(TestCase):
    def setUp(self):
        """Create reusable fixtures for calendar subscription model tests."""
        self.user = User.objects.create_user(
            username="subscriptionmodeluser",
            email="subscriptionmodeluser@example.com",
            password="password123",
        )
        self.subscription = CalendarSubscription.objects.create(
            user=self.user,
            name="KCL Timetable",
            source_url="https://example.com/calendar.ics",
        )

    def test_str_returns_user_id_and_name(self):
        """It should return the user id and subscription name."""
        self.assertEqual(
            str(self.subscription),
            f"{self.user.id} - KCL Timetable",
        )