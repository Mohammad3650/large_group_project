from django.test import TestCase
from scheduler.generator.schedule_generator import Scheduler

baseline = {
    'days': 1,
    'windows': [(480, 720)], # 08:00–12:00
    'scheduled': [(540, 600, "Lecture")], # 09:00–10:00
    'unscheduled': [(60, "Gym"), (90, "Revision")]
}

realistic = {
    'days': 3,
    'windows': [(480, 720), (780, 1020)],
    'scheduled': [(600, 660, "FC2 Lecture"), (840, 900, "SEG Meeting"), (540, 570, "Revision")],
    'unscheduled': [(120, "FC2 Revision"), (60, "Gym"), (45, "Revision")]
}

class BaselineSchedulerTest(TestCase):
    def setUp(self):
        self.days = baseline['days']
        self.windows = baseline['windows']
        self.scheduled = baseline['scheduled']
        self.unscheduled = baseline['unscheduled']
    
    def _build_and_solve(self, bias='early'):
        sch = Scheduler(self.days, self.windows, self.scheduled, self.unscheduled)
        sch.create_scheduled_intervals()
        sch.create_unscheduled_intervals()
        sch.overlapConstraints()
        if bias == "early":
            sch.earlyBiasConstraints()
        elif bias == "late":
            sch.lateBiasConstraints()
        return sch, sch.solve()
    
    def test_returns_two_scheduled_sessions(self):
        """Solver should return two results, one for each unscheduled event"""
        _, result = self._build_and_solve()

        self.assertEqual(len(result), 2)
        names = {name for (_, _, _, name) in result}
        self.assertSetEqual(names, {"Gym", "Revision"})
    
    def test_valid_start_times(self):
        """Each start time must fall within window and leave enough time for duration of event"""
        _, result = self._build_and_solve()

        window_start, window_end = self.windows[0]
        for start, end, duration, name in result:
            # start must be within window, and must allow duration to finish
            self.assertGreaterEqual(start, window_start, msg=f"{name} starts before window")
            self.assertLessEqual(start, window_end - duration, msg=f"{name} starts too late for duration")
            # end should not exceed window end
            self.assertLessEqual(end, window_end, msg=f"{name} ends after window")
    
    def test_no_overlap_with_scheduled_event(self):
        """No unscheduled sessions should overlap prescheduled events"""
        _, result = self._build_and_solve()
        scheduled_start, scheduled_end, _ = self.scheduled[0]

        for start, end, _, name in result:
            overlaps = not (end <= scheduled_start or start >= scheduled_end)
            self.assertFalse(overlaps, msg=f"{name} overlaps lecture")
    
    def test_no_overlap_between_unscheduled(self):
        """Unscheduled events should not overlap each other"""
        _, result = self._build_and_solve()

        for i in range(len(result)):
            start1, end1, _, name1 = result[i]
            for j in range(i + 1, len(result)):
                start2, end2, _, name2 = result[j]
                overlaps = not (end1 <= start2 or end2 <= start1)
                self.assertFalse(overlaps, msg=f"{name1} overlaps {name2}")
    
    def test_early_bias_picks_earliest_possible_start_times(self):
        """
        window: 08:00-12:00
        Lecture: 09:00-10:00
        Gym=60, Revision=90

        earliest possible starts = Gym - 08:00 Revision - 10:00
        """
        _, result = self._build_and_solve(bias="early")
        starts = sorted([s for (s, _, _, _) in result])
        self.assertEqual(starts[0], 480, msg="Expected an event to start at 08:00 under early bias")
        self.assertEqual(starts[1], 600, msg="Expected the other event to start at 10:00 under early bias")
    

class RealisticSchedulerTest(TestCase):
    def setUp(self):
        self.days = realistic['days']
        self.windows = realistic['windows']
        self.scheduled = realistic['scheduled']
        self.unscheduled = realistic['unscheduled']
    
    def _build_and_solve(self, bias='early'):
        sch = Scheduler(self.days, self.windows, self.scheduled, self.unscheduled)
        sch.create_scheduled_intervals()
        sch.create_unscheduled_intervals()
        sch.overlapConstraints()
        if bias == "early":
            sch.earlyBiasConstraints()
        elif bias == "late":
            sch.lateBiasConstraints()
        return sch, sch.solve()
    
    def test_returns_all_unscheduled_sessions(self):
        """Solver shhould return exactly 3 results"""
        _, result = self._build_and_solve()
        self.assertEqual(len(result), len(realistic['unscheduled']))
        names = {name for (_, _, _, name) in result}
        self.assertSetEqual(names, {"FC2 Revision", "Gym", "Revision"})
    
    def test_valid_start_times(self):
        """Start times must be winthin one window"""
        _, result = self._build_and_solve()
        for start, end, duration, name in result:
            in_any_window = any(
                start >= ws and start <= we - duration
                for ws, we in self.windows
            )
            self.assertTrue(in_any_window, msg=f"{name} start={start} not within any valid window")

    def test_each_session_ends_within_its_window(self):
        """Each session must not exceed a window"""
        _, result = self._build_and_solve()
        for start, end, duration, name in result:
            in_any_window = any(
                start >= ws and end <= we
                for ws, we in self.windows
            )
            self.assertTrue(in_any_window, msg=f"{name} end={end} spills outside its window")

    def test_no_overlap_between_all_intervals(self):
        """Unscheduled events must not overlap each other or any pre-scheduled event."""
        _, result = self._build_and_solve()
        all_intervals = [(s, e, n) for (s, e, _, n) in result]
        all_intervals += [(s, e, n) for (s, e, n) in self.scheduled]

        for i in range(len(all_intervals)):
            s1, e1, n1 = all_intervals[i]
            for j in range(i + 1, len(all_intervals)):
                s2, e2, n2 = all_intervals[j]
                overlaps = not (e1 <= s2 or e2 <= s1)
                self.assertFalse(overlaps, msg=f"{n1} ({s1}-{e1}) overlaps {n2} ({s2}-{e2})")

    def test_duration_is_respected(self):
        """Difference between each sessions start and end time must equal the given duration"""
        _, result = self._build_and_solve()
        duration_map = {name: dur for dur, name in self.unscheduled}
        for start, end, duration, name in result:
            self.assertEqual(end - start, duration_map[name], msg=f"{name} has wrong duration")


class EdgeCaseSchedulerTest(TestCase):
    def _solve(self, days, windows, scheduled, unscheduled, bias='early'):
        sch = Scheduler(days, windows, scheduled, unscheduled)
        sch.create_scheduled_intervals()
        sch.create_unscheduled_intervals()
        sch.overlapConstraints()
        if bias == 'early':
            sch.earlyBiasConstraints()
        return sch, sch.solve()

    def test_empty_unscheduled_returns_empty(self):
        _, result = self._solve(1, [(480, 720)], [(540, 600, "Lecture")], [])
        self.assertEqual(result, [])

    def test_infeasible_returns_empty(self):
        """Session is longer than the only available window gap."""
        _, result = self._solve(
            days=1,
            windows=[(480, 510)], # 30-min window
            scheduled=[],
            unscheduled=[(60, "Gym")] # 60-min session won't fit
        )
        self.assertEqual(result, [])

    def test_session_fits_exactly_in_window(self):
        """Session duration equals window duration with no scheduled events. Should successfully schedule event"""
        _, result = self._solve(
            days=1,
            windows=[(480, 540)], # exactly 60 mins
            scheduled=[],
            unscheduled=[(60, "Gym")]
        )
        self.assertEqual(len(result), 1)
        start, end, duration, name = result[0]
        self.assertEqual(start, 480)
        self.assertEqual(end, 540)

    def test_session_must_not_span_across_windows(self):
        """A session that would need to span two windows to fit should be infeasible."""
        _, result = self._solve(
            days=1,
            windows=[(480, 510), (540, 570)], # two 30-min windows
            scheduled=[],
            unscheduled=[(60, "Gym")] # needs 60 continuous mins
        )
        self.assertEqual(result, [], msg="Session should not span two separate windows")

    def test_multiple_sessions_same_duration(self):
        """Two identical duration sessions should both be placed without overlap."""
        _, result = self._solve(
            days=1,
            windows=[(480, 720)],
            scheduled=[],
            unscheduled=[(60, "Session A"), (60, "Session B")]
        )
        self.assertEqual(len(result), 2)
        (s1, e1, _, _), (s2, e2, _, _) = sorted(result, key=lambda x: x[0])
        self.assertLessEqual(e1, s2, msg="Identical duration sessions overlap")

