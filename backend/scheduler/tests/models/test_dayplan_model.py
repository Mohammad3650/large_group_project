from django.db import IntegrityError
from django.test import TestCase
from datetime import date, time

from scheduler.models.DayPlan import DayPlan
from scheduler.models.TimeBlock import TimeBlock
from scheduler.models.User import User


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

    def test_create_day_plan(self):
        day_plan = DayPlan.objects.create(user=self.user, date=date(2026, 2, 17))

        self.assertEqual(day_plan.user, self.user)
        self.assertEqual(day_plan.date, date(2026, 2, 17))

    def test_cannot_create_duplicate_day_plan_for_same_user(self):
        DayPlan.objects.create(user=self.user, date=date(2026, 2, 17))

        with self.assertRaises(IntegrityError):
            DayPlan.objects.create(user=self.user, date=date(2026, 2, 17))

    def test_different_users_can_have_same_date(self):
        other_user = User.objects.create_user(
            username="user2", email="user2@test.com", password="password123"
        )

        DayPlan.objects.create(user=self.user, date=date(2026, 2, 17))
        second = DayPlan.objects.create(user=other_user, date=date(2026, 2, 17))

        self.assertEqual(second.user, other_user)
