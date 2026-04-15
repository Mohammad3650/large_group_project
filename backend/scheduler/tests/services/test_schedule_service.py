from datetime import date, time, timedelta
from unittest.mock import MagicMock, patch
from django.test import TestCase, SimpleTestCase

from scheduler.services.schedule_service import ScheduleService

def make_time_block(name, start_h, start_m, end_h, end_m, date_val):
    tb = MagicMock()
    tb.name = name
    tb.start_time = time(start_h, start_m)
    tb.end_time = time(end_h, end_m)
    tb.day = MagicMock()
    tb.day.date = date_val
    return tb


WEEK_START = date(2024, 1, 1)
WEEK_END   = date(2024, 1, 7)

class ExtractScheduledMinsTests(SimpleTestCase):

    def setUp(self):
        self.service = ScheduleService()

    def test_single_block_on_first_day(self):
        tb = make_time_block("Work", 9, 0, 10, 30, WEEK_START)
        result = self.service.extract_scheduled_mins([tb], WEEK_START)
        self.assertEqual(result, [(540, 630, "Work")])

    def test_block_on_second_day_has_correct_offset(self):
        day2 = WEEK_START + timedelta(days=1)
        tb = make_time_block("Gym", 6, 0, 7, 0, day2)
        result = self.service.extract_scheduled_mins([tb], WEEK_START)
        # day_offset=1 -> 1*1440 + 360 = 1800, 1*1440 + 420 = 1860
        self.assertEqual(result, [(1800, 1860, "Gym")])

    def test_multiple_blocks_returns_all(self):
        day3 = WEEK_START + timedelta(days=2)
        blocks = [
            make_time_block("A", 8, 0, 9, 0, WEEK_START),
            make_time_block("B", 14, 0, 15, 0, day3),
        ]
        result = self.service.extract_scheduled_mins(blocks, WEEK_START)
        self.assertEqual(len(result), 2)
        self.assertEqual(result[0], (480, 540, "A"))
        self.assertEqual(result[1], (2 * 1440 + 840, 2 * 1440 + 900, "B"))

    def test_empty_time_blocks_returns_empty_list(self):
        self.assertEqual(self.service.extract_scheduled_mins([], WEEK_START), [])

class FetchScheduledTimeBlocksTests(SimpleTestCase):

    def setUp(self):
        self.service = ScheduleService()
        self.user = MagicMock()

    @patch("scheduler.services.schedule_service.TimeBlock")
    def test_filter_args(self, MockTimeBlock):
        mock_qs = MagicMock()
        MockTimeBlock.objects.filter.return_value = mock_qs
        mock_qs.select_related.return_value = mock_qs
        mock_qs.annotate.return_value = mock_qs

        self.service.fetch_scheduled_time_blocks(WEEK_START, WEEK_END, self.user)

        MockTimeBlock.objects.filter.assert_called_once_with(
            day__user=self.user,
            day__date__range=(WEEK_START, WEEK_END),
        )

class GenerateTests(TestCase):

    def _make_service(self):
        service = ScheduleService()
        service.parser = MagicMock()
        service.builder = MagicMock()
        return service

    def _parsed(self, unscheduled=None):
        parsed = MagicMock()
        parsed.unscheduled = unscheduled if unscheduled is not None else ["task"]
        parsed.week_start = WEEK_START
        parsed.week_end = WEEK_END
        return parsed

    def test_early_exit_when_nothing_to_schedule(self):
        service = self._make_service()
        service.parser.parse.return_value = self._parsed(unscheduled=[])
        service.builder.build.return_value = {"slots": []}

        result = service.generate(
            user=MagicMock(),
            validated_data={"week_start": WEEK_START, "week_end": WEEK_END},
        )

        service.builder.build.assert_called_once_with([], scheduled=[], week_start=WEEK_START)
        self.assertEqual(result, {"slots": []})

    @patch("scheduler.services.schedule_service.Scheduler")
    def test_solutions_forwarded_to_build(self, MockScheduler):
        service = self._make_service()
        service.parser.parse.return_value = self._parsed()

        fake_solutions = [(0, 60, 0, "task1", "cat", "red", "high")]
        mock_engine = MagicMock()
        mock_engine.solve.return_value = fake_solutions
        MockScheduler.return_value = mock_engine

        fake_qs = MagicMock()
        fake_qs.__iter__ = MagicMock(return_value=iter([]))
        fake_qs.values.return_value = []
        service.fetch_scheduled_time_blocks = MagicMock(return_value=fake_qs)
        service.extract_scheduled_mins = MagicMock(return_value=[])
        service.builder.build.return_value = {"slots": ["task1"]}

        result = service.generate(
            user=MagicMock(),
            validated_data={"week_start": WEEK_START, "week_end": WEEK_END},
        )

        self.assertEqual(result, {"slots": ["task1"]})

    @patch("scheduler.services.schedule_service.Scheduler")
    def test_correct_user_passed_to_fetch(self, MockScheduler):
        service = self._make_service()
        user = MagicMock(id=42)
        service.parser.parse.return_value = self._parsed()

        mock_engine = MagicMock()
        mock_engine.solve.return_value = []
        MockScheduler.return_value = mock_engine

        fake_qs = MagicMock()
        fake_qs.__iter__ = MagicMock(return_value=iter([]))
        fake_qs.values.return_value = []
        service.fetch_scheduled_time_blocks = MagicMock(return_value=fake_qs)
        service.extract_scheduled_mins = MagicMock(return_value=[])

        service.generate(
            user=user,
            validated_data={"week_start": WEEK_START, "week_end": WEEK_END},
        )

        service.fetch_scheduled_time_blocks.assert_called_once_with(WEEK_START, WEEK_END, user)