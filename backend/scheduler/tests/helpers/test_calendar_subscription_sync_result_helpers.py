from django.test import TestCase

from scheduler.services.calendar_subscription_sync_result_helpers import (
    build_sync_result,
    record_sync_outcome,
)


class CalendarSubscriptionSyncResultHelpersTest(TestCase):
    def test_build_sync_result_returns_empty_counter_dictionary(self):
        """It should build an empty sync result dictionary."""
        self.assertEqual(
            build_sync_result(),
            {
                "created": 0,
                "updated": 0,
                "skipped": 0,
            },
        )

    def test_record_sync_outcome_increments_matching_counter(self):
        """It should increment the matching sync result counter."""
        sync_result = build_sync_result()

        record_sync_outcome(sync_result, "updated")

        self.assertEqual(
            sync_result,
            {
                "created": 0,
                "updated": 1,
                "skipped": 0,
            },
        )