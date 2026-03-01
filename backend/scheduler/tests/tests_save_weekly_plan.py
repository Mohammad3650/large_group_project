from datetime import date, datetime, timedelta

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from scheduler.models import DayPlan, TimeBlock
from scheduler.serializer.save_plan_serializer import (
    SaveTimeBlockSerializer,
    SaveWeeklyPlanSerializer,
)


class SaveWeeklyPlanSerializerTests(TestCase):
    def test_week_start_must_be_monday(self):
        # Tuesday
        data = {"week_start": "2026-02-24", "overwrite": True, "events": []}
        s = SaveWeeklyPlanSerializer(data=data)
        self.assertFalse(s.is_valid())
        self.assertIn("week_start", s.errors)

    def test_week_start_accepts_uk_format(self):
        # Monday in UK format
        data = {"week_start": "23/02/2026", "overwrite": True, "events": []}
        s = SaveWeeklyPlanSerializer(data=data)
        self.assertTrue(s.is_valid(), s.errors)
        self.assertEqual(s.validated_data["week_start"], date(2026, 2, 23))

    def test_event_accepts_iso_date_and_valid_times(self):
        data = {
            "date": "2026-02-23",
            "start_time": "09:00",
            "end_time": "10:00",
            "block_type": "study",
        }
        s = SaveTimeBlockSerializer(data=data)
        self.assertTrue(s.is_valid(), s.errors)
        self.assertEqual(s.validated_data["date"], date(2026, 2, 23))

    def test_event_accepts_uk_date_format(self):
        data = {
            "date": "23/02/2026",
            "start_time": "09:00",
            "end_time": "10:00",
            "block_type": "study",
        }
        s = SaveTimeBlockSerializer(data=data)
        self.assertTrue(s.is_valid(), s.errors)
        self.assertEqual(s.validated_data["date"], date(2026, 2, 23))

    def test_event_rejects_invalid_time_order(self):
        data = {
            "date": "2026-02-23",
            "start_time": "10:00",
            "end_time": "09:00",
            "block_type": "study",
        }
        s = SaveTimeBlockSerializer(data=data)
        self.assertFalse(s.is_valid())
        self.assertTrue(any("end_time" in str(e).lower() or "after" in str(e).lower() for e in s.errors.values()))

    def test_event_accepts_start_end_datetime_and_converts(self):
        data = {
            "start_datetime": "2026-02-23T09:00:00Z",
            "end_datetime": "2026-02-23T10:00:00Z",
            "block_type": "study",
        }
        s = SaveTimeBlockSerializer(data=data)
        self.assertTrue(s.is_valid(), s.errors)
        self.assertEqual(s.validated_data["date"], date(2026, 2, 23))
        self.assertEqual(str(s.validated_data["start_time"]), "09:00:00")
        self.assertEqual(str(s.validated_data["end_time"]), "10:00:00")

    def test_event_requires_date_times_or_datetimes(self):
        data = {"block_type": "study"}
        s = SaveTimeBlockSerializer(data=data)
        self.assertFalse(s.is_valid())
        # should contain the custom validation message
        self.assertTrue(any("Provide either" in str(v) for v in s.errors.values()))


class SaveWeeklyPlanViewTests(APITestCase):
    def setUp(self):
        self.url = "/api/plans/save/"

        User = get_user_model()
        self.user = User.objects.create_user(username="testuser", password="pass12345")

        refresh = RefreshToken.for_user(self.user)
        access = str(refresh.access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")

        self.week_start = date(2026, 2, 23)  # Monday

    def test_requires_auth(self):
        self.client.credentials()  # clear auth
        res = self.client.post(self.url, {"week_start": "2026-02-23", "events": []}, format="json")
        self.assertEqual(res.status_code, 401)

    def test_successfully_saves_events_and_creates_dayplans(self):
        payload = {
            "week_start": self.week_start.isoformat(),
            "overwrite": True,
            "events": [
                {
                    "date": self.week_start.isoformat(),
                    "start_time": "09:00",
                    "end_time": "10:00",
                    "block_type": "study",
                    "location": "home",
                    "description": "SEG revision",
                    "is_fixed": True,
                }
            ],
        }

        res = self.client.post(self.url, payload, format="json")
        self.assertEqual(res.status_code, 201, res.data)
        self.assertEqual(res.data["events_saved"], 1)
        self.assertEqual(res.data["week_start"], str(self.week_start))

        # DayPlans are created for the whole week (This will be 7)
        self.assertEqual(DayPlan.objects.filter(user=self.user).count(), 7)

        dp = DayPlan.objects.get(user=self.user, date=self.week_start)
        blocks = TimeBlock.objects.filter(day=dp)
        self.assertEqual(blocks.count(), 1)

        b = blocks.first()
        self.assertEqual(b.description, "SEG revision")
        self.assertEqual(str(b.start_time), "09:00:00")
        self.assertEqual(str(b.end_time), "10:00:00")

    def test_description_defaults_to_empty_string(self):
        payload = {
            "week_start": self.week_start.isoformat(),
            "overwrite": True,
            "events": [
                {
                    "date": (self.week_start + timedelta(days=1)).isoformat(),
                    "start_time": "11:00",
                    "end_time": "12:00",
                    "block_type": "study",
                }
            ],
        }

        res = self.client.post(self.url, payload, format="json")
        self.assertEqual(res.status_code, 201, res.data)

        dp = DayPlan.objects.get(user=self.user, date=self.week_start + timedelta(days=1))
        b = TimeBlock.objects.get(day=dp)
        self.assertEqual(b.description, "")

    def test_uk_date_format_is_accepted_in_events(self):
        payload = {
            "week_start": "23/02/2026",  # UK Monday
            "overwrite": True,
            "events": [
                {
                    "date": "25/02/2026",  # UK date (Wednesday)
                    "start_time": "09:00",
                    "end_time": "10:00",
                    "block_type": "study",
                }
            ],
        }

        res = self.client.post(self.url, payload, format="json")
        self.assertEqual(res.status_code, 201, res.data)

        dp = DayPlan.objects.get(user=self.user, date=date(2026, 2, 25))
        self.assertEqual(TimeBlock.objects.filter(day=dp).count(), 1)

    def test_rejects_event_outside_week_range(self):
        outside = self.week_start + timedelta(days=7)  # next Monday (outside)
        payload = {
            "week_start": self.week_start.isoformat(),
            "overwrite": True,
            "events": [
                {
                    "date": outside.isoformat(),
                    "start_time": "09:00",
                    "end_time": "10:00",
                    "block_type": "study",
                }
            ],
        }

        res = self.client.post(self.url, payload, format="json")
        self.assertEqual(res.status_code, 400)

        # Should not create any TimeBlocks
        self.assertEqual(TimeBlock.objects.count(), 0)

    def test_overwrite_deletes_existing_blocks_for_each_day(self):
        # Seed an existing block for Monday
        dp, _ = DayPlan.objects.get_or_create(user=self.user, date=self.week_start)
        TimeBlock.objects.create(
            day=dp,
            name="old",
            block_type="study",
            location="home",
            description="old block",
            is_fixed=True,
            start_time="09:00",
            end_time="10:00",
        )
        self.assertEqual(dp.time_blocks.count(), 1)

        payload = {
            "week_start": self.week_start.isoformat(),
            "overwrite": True,
            "events": [
                {
                    "date": self.week_start.isoformat(),
                    "start_time": "10:00",
                    "end_time": "11:00",
                    "block_type": "study",
                    "description": "new block",
                }
            ],
        }

        res = self.client.post(self.url, payload, format="json")
        self.assertEqual(res.status_code, 201, res.data)

        dp.refresh_from_db()
        self.assertEqual(dp.time_blocks.count(), 1)
        self.assertEqual(dp.time_blocks.first().description, "new block")

    def test_dayplan_unique_constraint_is_respected(self):
        payload = {
            "week_start": self.week_start.isoformat(),
            "overwrite": False,
            "events": [
                {
                    "date": self.week_start.isoformat(),
                    "start_time": "09:00",
                    "end_time": "10:00",
                    "block_type": "study",
                }
            ],
        }

        res1 = self.client.post(self.url, payload, format="json")
        self.assertEqual(res1.status_code, 201, res1.data)

        res2 = self.client.post(self.url, payload, format="json")
        self.assertEqual(res2.status_code, 201, res2.data)

        # Still only 1 DayPlan for that date due to get_or_create + unique constraint
        self.assertEqual(DayPlan.objects.filter(user=self.user, date=self.week_start).count(), 1)