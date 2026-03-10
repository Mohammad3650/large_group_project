from django.test import TestCase
from datetime import date, time

from scheduler.models.DayPlan import DayPlan
from scheduler.models.TimeBlock import TimeBlock
from scheduler.models.users import User


class DayPlanModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            email="testuser@testuser.com",
            password="password123",
            first_name="test",
            last_name="user",
            phone_number="01122334455",
        )

    # test you can create a day plan with appropriate fields
    def test_create_day_plan(self):
        day_plan = DayPlan.objects.create(user=self.user, date=date(2026, 2, 17))

        self.assertEqual(day_plan.user, self.user)
        self.assertEqual(day_plan.date, date(2026, 2, 17))
