from django.test import TestCase
from django.utils import timezone
from rest_framework import status

from scheduler.models.TimeBlock import TimeBlock
from scheduler.models.User import User
from scheduler.models.DayPlan import DayPlan
from scheduler.services.time_block_mutation_service import mutate_time_block


class TimeBlockMutationServiceTest(TestCase):
    def setUp(self):
        """Create two users, a day plan, and a time block for use across all mutation tests."""
        self.user = User.objects.create_user(
            username="testuser",
            email="testuser@example.com",
            password="password123",
            first_name="Test",
            last_name="User",
            phone_number="07700900001",
        )
        self.other_user = User.objects.create_user(
            username="otheruser",
            email="otheruser@example.com",
            password="password123",
            first_name="Other",
            last_name="User",
            phone_number="07700900002",
        )
        self.day_plan = DayPlan.objects.create(
            user=self.user,
            date=timezone.now().date(),
        )
        self.block = TimeBlock.objects.create(
            day=self.day_plan,
            name="Test Block",
            block_type="study",
            start_time=timezone.now().time(),
            end_time=timezone.now().time(),
        )

    def test_mutate_time_block_applies_single_field_mutation(self):
        """It should apply a single field mutation and persist it to the database."""
        response = mutate_time_block(self.user, self.block.id, {"pinned": True})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.block.refresh_from_db()
        self.assertTrue(self.block.pinned)

    def test_mutate_time_block_applies_multiple_field_mutations(self):
        """It should apply multiple field mutations in a single call and persist them all."""
        now = timezone.now()
        response = mutate_time_block(self.user, self.block.id, {
            "pinned": True,
            "pinned_at": now,
        })

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.block.refresh_from_db()
        self.assertTrue(self.block.pinned)
        self.assertIsNotNone(self.block.pinned_at)

    def test_mutate_time_block_can_set_fields_to_none(self):
        """It should correctly set fields to None when passed as a mutation value."""
        self.block.completed_at = timezone.now()
        self.block.save()

        response = mutate_time_block(self.user, self.block.id, {"completed_at": None})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.block.refresh_from_db()
        self.assertIsNone(self.block.completed_at)

    def test_mutate_time_block_returns_404_for_nonexistent_block(self):
        """It should return 404 when no time block exists with the given ID."""
        response = mutate_time_block(self.user, 999999, {"pinned": True})

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_mutate_time_block_returns_404_for_block_owned_by_another_user(self):
        """It should return 404 when the time block exists but belongs to a different user."""
        response = mutate_time_block(self.other_user, self.block.id, {"pinned": True})

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.block.refresh_from_db()
        self.assertFalse(self.block.pinned)