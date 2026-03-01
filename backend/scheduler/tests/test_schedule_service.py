from django.test import TestCase
from unittest.mock import patch, MagicMock

from scheduler.services.schedule_service import ScheduleService


class ScheduleServiceTests(TestCase):
    def setUp(self):
        self.service = ScheduleService()
        self.week_start = "2026-02-23" 

    @patch("scheduler.services.schedule_service.ScheduleResponseBuilder.build")
    @patch("scheduler.services.schedule_service.Scheduler")
    def test_generate_returns_builder_empty_when_no_unscheduled(
        self,
        MockScheduler,
        mock_build,
    ):
        validated_data = {
            "week_start": "2026-02-23",
            "days": 7,
            "windows": [{"start_min": 540, "end_min": 1020}],
            "scheduled": [],
            "unscheduled": [],
            "preference": "early",
        }

        mock_build.return_value = {"week_start": "2026-02-23", "events": []}

        result = self.service.generate(validated_data)

        MockScheduler.assert_not_called()
        mock_build.assert_called_once()
        self.assertEqual(result["events"], [])

    @patch("scheduler.services.schedule_service.Scheduler")
    def test_generate_uses_early_bias_by_default(self, MockScheduler):
        engine = MockScheduler.return_value
        engine.solve.return_value = [(480, 540, 60, "Gym")]

        validated_data = {
            "week_start": self.week_start,
            "days": 7,
            "windows": [{"start_min": 540, "end_min": 1020}],
            "scheduled": [],
            "unscheduled": [{"duration_mins": 60, "name": "Gym"}],
            "preference": "early",
        }

        self.service.generate(validated_data)

        engine.create_scheduled_intervals.assert_called_once()
        engine.create_unscheduled_intervals.assert_called_once()
        engine.overlapConstraints.assert_called_once()
        engine.earlyBiasConstraints.assert_called_once()
        engine.lateBiasConstraints.assert_not_called()
        engine.solve.assert_called_once()

    @patch("scheduler.services.schedule_service.Scheduler")
    def test_generate_uses_late_bias_when_preference_late(self, MockScheduler):
        engine = MockScheduler.return_value
        engine.solve.return_value = [(480, 540, 60, "Gym")]

        validated_data = {
            "week_start": self.week_start,
            "days": 7,
            "windows": [{"start_min": 540, "end_min": 1020}],
            "scheduled": [],
            "unscheduled": [{"duration_mins": 60, "name": "Gym"}],
            "preference": "late",
        }

        self.service.generate(validated_data)

        engine.lateBiasConstraints.assert_called_once()
        engine.earlyBiasConstraints.assert_not_called()
        engine.solve.assert_called_once()