import datetime
from django.test import SimpleTestCase

from scheduler.services.schedule_generator import Scheduler
from scheduler.services.request_parser import ParsedScheduleRequest


class SchedulerTests(SimpleTestCase):

    def make_request(self, days=1, windows=None, unscheduled=None, even_spread=False, include_scheduled=True):
        return ParsedScheduleRequest(
            week_start=datetime.date(2026, 3, 9),
            week_end=datetime.date(2026, 3, 9) + datetime.timedelta(days=days - 1),
            days=days,
            even_spread=even_spread,
            include_scheduled=include_scheduled,
            windows=windows or [(540, 1020, False)],
            unscheduled=unscheduled or [],
        )

    def build_and_solve(self, request, scheduled=None):
        scheduler = Scheduler(request, scheduled or [])
        scheduler.create_scheduled_intervals()
        scheduler.create_unscheduled_intervals()
        scheduler.overlap_constraints()
        scheduler.apply_constraints()
        result = scheduler.solve()
        return scheduler, result

    def test_single_event_fits_inside_window(self):
        request = self.make_request(
            days=1,
            windows=[(540, 720, False)],
            unscheduled=[(60, "Revision", 1, False, "None", "", "study", "")]
        )
        
        _, result = self.build_and_solve(request, scheduled=[])
        self.assertEqual(len(result), 1)
        start, end, duration, name, *_ = result[0]
        self.assertEqual(name, "Revision")
        self.assertEqual(duration, 60)
        self.assertGreaterEqual(start, 540)
        self.assertLessEqual(start, 660)
        self.assertEqual(end - start, 60)

    def test_infeasible_schedule_returns_empty(self):
        request = self.make_request(
            days=1,
            windows=[(540, 570, False)],
            unscheduled=[(60, "Revision", 1, False, "None", "", "study", "")]
        )
        _, result = self.build_and_solve(request, scheduled=[])

        self.assertEqual(result, [])

    def test_daily_task_creates_one_per_day(self):
        request = self.make_request(
            days=3,
            windows=[(540, 720, True)],
            unscheduled=[(60, "Gym", 1, True, "None", "", "exercise", "")]
        )
        _, result = self.build_and_solve(request, scheduled=[])

        self.assertEqual(len(result), 3)
        day_indexes = sorted(start // 1440 for start, *_ in result)
        self.assertEqual(day_indexes, [0, 1, 2])

    def test_two_unscheduled_events_do_not_overlap(self):
        request = self.make_request(
            days=1,
            windows=[(540, 660, False)],  # 09:00-11:00
            unscheduled=[
                (60, "Task A", 1, False, "None", "", "study", ""),
                (60, "Task B", 1, False, "None", "", "study", "")
                ],
        )

        _, result = self.build_and_solve(request)
        self.assertEqual(len(result), 2)
        result = sorted(result, key=lambda x: x[0])
        first_start, first_end, *_ = result[0]
        second_start, second_end, *_ = result[1]
        self.assertLessEqual(first_end, second_start)
        self.assertEqual(first_end - first_start, 60)
        self.assertEqual(second_end - second_start, 60)

    def test_event_uses_second_window_if_first_blocked(self):
        request = self.make_request(
            days=1,
            windows=[(540, 600, False), (660, 720, False)],
            unscheduled=[(60, "Revision", 1, False, "None", "", "study", "")],
        )
        scheduled = [(540, 600, "Lecture")] # blocks first window fully
        _, result = self.build_and_solve(request, scheduled)
        self.assertEqual(len(result), 1)
        start, end, *_ = result[0]
        self.assertEqual(start, 660)
        self.assertEqual(end, 720)

    def test_non_daily_window_is_not_repeated(self):
        request = self.make_request(
            days=3,
            windows=[(540, 600, False)],  # only day 0 absolute
            unscheduled=[(60, "Study", 1, False, "None", "", "study", "")],
        )
        scheduler = Scheduler(request, [])
        self.assertEqual(scheduler.windows, [(540, 600)])

    def test_daily_window_is_repeated_for_each_day(self):
        request = self.make_request(
            days=3,
            windows=[(540, 600, True)],
            unscheduled=[],
        )
        scheduler = Scheduler(request, [])
        self.assertEqual( scheduler.windows, [(540, 600), (1980, 2040), (3420, 3480), ])

    def test_frequency_two_creates_two_sessions(self):
        request = self.make_request(
            days=3,
            windows=[(540, 720, True)],
            unscheduled=[(60, "Revision", 2, False, "None", "", "study", "")],
        )
        _, result = self.build_and_solve(request)
        self.assertEqual(len(result), 2)

    def test_daily_true_overrides_frequency(self):
        request = self.make_request(
            days=4,
            windows=[(540, 720, True)],
            unscheduled=[(60, "Gym", 2, True, "None", "", "exercise", "")],
        )
        _, result = self.build_and_solve(request)
        self.assertEqual(len(result), 4)

    def test_daily_recurring_event_appears_once_per_day(self):
        request = self.make_request(
            days=4,
            windows=[(540, 720, True)],
            unscheduled=[(60, "Gym", 1, True, "None", "", "exercise", "")],
        )
        _, result = self.build_and_solve(request)
        self.assertEqual(len(result), 4)
        day_counts = {}
        for start, *_ in result:
            day = start // 1440
            day_counts[day] = day_counts.get(day, 0) + 1
        self.assertEqual(day_counts, {0: 1, 1: 1, 2: 1, 3: 1})

    def test_even_spread_places_two_events_on_different_days(self):
        request = self.make_request(
            days=2,
            windows=[(540, 720, True)],
            unscheduled=[
                (60, "Task A", 1, False, "None", "", "study", ""),
                (60, "Task B", 1, False, "None", "", "study", "")],
            even_spread=True,
            include_scheduled=False,
        )
        _, result = self.build_and_solve(request)
        self.assertEqual(len(result), 2)
        days = sorted(start // 1440 for start, *_ in result)
        self.assertEqual(days, [0, 1])

    def test_include_scheduled_in_even_spread_affects_placement(self):
        request = self.make_request(
            days=2,
            windows=[(540, 720, True)],
            unscheduled=[ (60, "Task A", 1, False, "None", "", "study", ""), ],
            even_spread=True,
            include_scheduled=True,
        )
        scheduled = [(540, 600, "Lecture")] # day 0 already has something
        _, result = self.build_and_solve(request, scheduled)
        self.assertEqual(len(result), 1)
        start, *_ = result[0]
        day = start // 1440
        # With include_scheduled=True, solver should prefer day 1 to balance counts
        self.assertEqual(day, 1)

    def test_zero_unscheduled_returns_empty_solution(self):
        request = self.make_request(
            days=2,
            windows=[(540, 720, True)],
            unscheduled=[],
        )
        _, result = self.build_and_solve(request)
        self.assertEqual(result, [])

    def test_unscheduled_sessions_all_have_correct_duration(self):
        request = self.make_request(
            days=1,
            windows=[(540, 900, False)],
            unscheduled=[
                (30, "Task A", 1, False, "None", "", "study", ""),
                (45, "Task B", 1, False, "None", "", "study", ""),
                (60, "Task C", 1, False, "None", "", "study", "")],
        )
        _, result = self.build_and_solve(request)
        self.assertEqual(len(result), 3)
        durations = sorted(duration for _, _, duration, *_ in result)
        self.assertEqual(durations, [30, 45, 60])
        for start, end, duration, *_ in result:
            self.assertEqual(end - start, duration)
