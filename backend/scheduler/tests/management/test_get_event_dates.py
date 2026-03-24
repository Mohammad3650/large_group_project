from datetime import date, timedelta
from django.test import TestCase
from scheduler.management.commands.seed import get_event_dates


class GetEventDatesTest(TestCase):

    def test_returns_correct_number_of_dates(self):
        """Tests that get_event_dates returns exactly 25 dates."""
        dates = get_event_dates()
        self.assertEqual(len(dates), 25)

    def test_four_overdue_dates(self):
        """Tests that 4 dates are in the past."""
        today = date.today()
        dates = get_event_dates()
        overdue = [d for d in dates if d < today]
        self.assertEqual(len(overdue), 4)

    def test_two_days_ago_dates(self):
        """Tests that 2 dates are exactly 2 days ago."""
        today = date.today()
        dates = get_event_dates()
        two_days_ago = [d for d in dates if d == today - timedelta(days=2)]
        self.assertEqual(len(two_days_ago), 2)

    def test_one_day_ago_dates(self):
        """Tests that 2 dates are exactly 1 day ago."""
        today = date.today()
        dates = get_event_dates()
        one_day_ago = [d for d in dates if d == today - timedelta(days=1)]
        self.assertEqual(len(one_day_ago), 2)

    def test_three_today_dates(self):
        """Tests that 3 dates are today."""
        today = date.today()
        dates = get_event_dates()
        today_dates = [d for d in dates if d == today]
        self.assertEqual(len(today_dates), 3)

    def test_three_tomorrow_dates(self):
        """Tests that 3 dates are tomorrow."""
        today = date.today()
        dates = get_event_dates()
        tomorrow_dates = [d for d in dates if d == today + timedelta(days=1)]
        self.assertEqual(len(tomorrow_dates), 3)

    def test_five_next_seven_days_dates(self):
        """Tests that 5 dates fall within the next 7 days (days 2-6)."""
        today = date.today()
        dates = get_event_dates()
        next_seven = [d for d in dates if today + timedelta(days=2) <= d <= today + timedelta(days=6)]
        self.assertEqual(len(next_seven), 5)

    def test_ten_beyond_seven_days_dates(self):
        """Tests that 10 dates fall beyond the next 7 days (days 8-17)."""
        today = date.today()
        dates = get_event_dates()
        beyond = [d for d in dates if d >= today + timedelta(days=8)]
        self.assertEqual(len(beyond), 10)
