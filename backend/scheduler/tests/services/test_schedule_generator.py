import datetime
from django.test import SimpleTestCase

from scheduler.services.schedule_generator import Scheduler
from scheduler.services.request_parser import ParsedScheduleRequest
from unittest.mock import patch


class SchedulerGeneratorTest(SimpleTestCase):

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
        result = scheduler.solve()
        return scheduler, result
    
    def time_to_abs(self, time):
        return (time.hour * 60) + (time.minute * 60)

    def test_single_event_fits_inside_window(self):
        """Test that a single unscheduled event fits within the available time window."""
        request = self.make_request(
            days=1,
            windows=[(0, 540, True), (720, 1440, True)],
            unscheduled=[("Revision", 60, 1, False, "None", "Library", "study", "Studying")]
        )
        
        _, result = self.build_and_solve(request, scheduled=[])
        self.assertEqual(len(result), 1)
        start, end, _, name, *_ = result[0]
        self.assertEqual(name, "Revision")
        self.assertEqual(self.time_to_abs(start), 540)
        self.assertEqual(self.time_to_abs(end), 600)
        self.assertEqual(self.time_to_abs(end) - self.time_to_abs(start), 60)

    @patch('sys.stdout')
    def test_infeasible_schedule_returns_empty(self, mock_stdout):
        """Test that an infeasible schedule (event too long for window) returns an empty result."""
        request = self.make_request(
            days=1,
            windows=[(0, 540, False), (570, 1440, True)],
            unscheduled=[("Revision", 60, 1, False, "None", "Library", "study", "Studying")]
        )
        _, result = self.build_and_solve(request, scheduled=[])

        self.assertEqual(result, [])

    def test_daily_task_creates_one_per_day(self):
        """Test that a daily recurring event creates one instance per day."""
        request = self.make_request(
            days=3,
            windows=[(0, 540, True), (700, 1440, True)],
            unscheduled=[("DailyRevision", 60, 1, True, "None", "Library", "study", "Studying")]
        )
        _, result = self.build_and_solve(request, scheduled=[])

        self.assertEqual(len(result), 3)
        self.assertEqual(len(set( [date for _, _, date, *_ in result] )), 3)

    def test_two_unscheduled_events_do_not_overlap(self):
        """Test that two unscheduled events in the same window do not overlap."""
        request = self.make_request(
            days=1,
            windows=[(0, 540, True), (660, 1440, True)],  # 09:00-11:00
            unscheduled=[
                ("Revision 1", 60, 1, False, "None", "Library", "study", "Studying"),
                ("Revision 2", 60, 1, False, "None", "Library", "study", "Studying")
                ],
        )

        _, result = self.build_and_solve(request)
        self.assertEqual(len(result), 2)
        result = sorted(result, key=lambda x: x[0])
        _, first_end, *_ = result[0]
        second_start, *_ = result[1]
        self.assertLessEqual(first_end, second_start)


    def test_event_uses_second_window_if_first_blocked(self):
        """Test that an event uses the second window if the first is blocked by a scheduled event."""
        request = self.make_request(
            days=1,
            windows=[(0, 540, True), (600, 660, True), (720, 1440, True)],
            unscheduled=[("Revision", 60, 1, False, "None", "Library", "study", "Studying")],
        )
        scheduled = [(540, 600, "Lecture")] # blocks first window fully
        _, result = self.build_and_solve(request, scheduled)
        self.assertEqual(len(result), 1)
        start, end, *_ = result[0]
        self.assertEqual(start, datetime.time(11, 0))
        self.assertEqual(end, datetime.time(12, 0))

    def test_daily_window_is_repeated_for_each_day(self):
        """Test that a daily window is repeated for each day."""
        request = self.make_request(
            days=3,
            windows=[(540, 600, True)],
            unscheduled=[],
        )
        scheduler, _ = self.build_and_solve(request)
        days = scheduler.days
        for day in days:
            self.assertEqual(len(day.events), 1)

    def test_frequency_two_creates_two_sessions(self):
        """Test that frequency=2 creates exactly two sessions."""
        request = self.make_request(
            days=3,
            windows=[(0, 540, True), (720, 1440, True)],
            unscheduled=[("Revision", 60, 2, False, "None", "Library", "study", "Studying")],
        )
        _, result = self.build_and_solve(request)
        self.assertEqual(len(result), 2)

    def test_daily_true_overrides_frequency(self):
        """Test that daily=True overrides frequency and creates one per day."""
        request = self.make_request(
            days=4,
            windows=[(0, 540, True), (720, 1440, True)],
            unscheduled=[("Revision", 60, 2, True, "None", "Library", "study", "Studying")],
        )
        _, result = self.build_and_solve(request)
        self.assertEqual(len(result), 4)

    def test_daily_recurring_event_appears_once_per_day(self):
        """Test that a daily recurring event appears exactly once per day."""
        request = self.make_request(
            days=4,
            windows=[(0, 540, True), (720, 1440, True)],
            unscheduled=[("Revision", 60, 1, True, "None", "Library", "study", "Studying")],
        )
        _, result = self.build_and_solve(request)
        self.assertEqual(len(result), 4)
        date_counts = {}
        for _, _, date, *_ in result:
            date_counts[date] = date_counts.get(date, 0) + 1
        self.assertTrue(all(count == 1 for count in date_counts.values()))

    def test_even_spread_places_two_events_on_different_days(self):
        """Test that even spread places two events on different days."""
        request = self.make_request(
            days=2,
            windows=[(0, 540, True), (720, 1440, True)],
            unscheduled=[
                ("Task A", 60, 1, False, "None", "Library", "study", "Studying"),
                ("Task B", 60, 1, False, "None", "Library", "study", "Studying")],
            even_spread=True,
            include_scheduled=False,
        )
        _, result = self.build_and_solve(request)
        self.assertEqual(len(result), 2)
        days = set([date for _, _, date, *_ in result])
        self.assertEqual(len(days), 2)

    def test_include_scheduled_in_even_spread_affects_placement(self):
        """Test that including scheduled events in even spread affects placement."""
        request = self.make_request(
            days=2,
            windows=[(0, 540, True), (720, 1440, True)],
            unscheduled=[ ("Revision", 60, 1, False, "None", "Library", "study", "Studying"), ],
            even_spread=True,
            include_scheduled=True,
        )
        scheduled = [(540, 600, "Lecture")]
        _, result = self.build_and_solve(request, scheduled)
        self.assertEqual(len(result), 1)

        self.assertNotEqual(request.week_start, result[0][2])

    def test_zero_unscheduled_returns_empty_solution(self):
        """Test that zero unscheduled events return an empty solution."""
        request = self.make_request(
            days=2,
            windows=[(540, 720, True)],
            unscheduled=[],
        )
        _, result = self.build_and_solve(request)
        self.assertEqual(result, [])

    def test_unscheduled_sessions_all_have_correct_duration(self):
        """Test that all unscheduled sessions have their correct durations."""
        request = self.make_request(
            days=1,
            windows=[(540, 900, False)],
            unscheduled=[
                ("Revision", 30, 1, False, "None", "Library", "study", "Studying"),
                ("Revision", 45, 1, False, "None", "Library", "study", "Studying"),
                ("Revision", 60, 1, False, "None", "Library", "study", "Studying")],
        )
        _, result = self.build_and_solve(request)
        self.assertEqual(len(result), 3)
        durations = sorted(
            (end.hour * 60 + end.minute) - (start.hour * 60 + start.minute)
            for start, end, *_ in result
        )
        self.assertEqual(durations, [30, 45, 60])
    
    def test_early_preference_pushes_event_to_window_start(self):
        """Test that 'Early' preference pushes the event to the start of the window."""
        request = self.make_request(
            days=1,
            windows=[(0, 540, True), (720, 1440, True)],
            unscheduled=[("Revision", 60, 1, False, "Early", "Library", "study", "Studying")]
        )

        _, result = self.build_and_solve(request)
        self.assertEqual(len(result), 1)
        start, end, *_ = result[0]
        self.assertEqual(start, datetime.time(9))
        self.assertEqual(end, datetime.time(10))
    
    def test_late_preference_pushes_event_to_window_end(self):
        """Test that 'Late' preference pushes the event to the end of the window."""
        request = self.make_request(
            days=1,
            windows=[(0, 540, True), (720, 1440, True)],
            unscheduled=[("Revision", 60, 1, False, "Late", "Library", "study", "Studying")]
        )

        _, result = self.build_and_solve(request)
        self.assertEqual(len(result), 1)
        start, end, *_ = result[0]
        self.assertEqual(start, datetime.time(11, 0)) 
        self.assertEqual(end, datetime.time(12, 0))

    def test_event_str_and_repr(self):
        """Test Event __str__ and __repr__ methods."""
        from scheduler.services.schedule_generator import Event
        event = Event(True, 540, 600, "Test")
        str_repr = str(event)
        repr_repr = repr(event)
        self.assertIn("start:", str_repr)
        self.assertIn("end:", str_repr)
        self.assertIn("name: Test", str_repr)
        self.assertIn("scheduled: True", str_repr)
        self.assertEqual(str_repr, repr_repr)

    def test_unscheduled_event_creation(self):
        """Test UnscheduledEvent creation."""
        from scheduler.services.schedule_generator import UnscheduledEvent
        event = UnscheduledEvent(False, "Test", 60, 1, True, "Early", "Home", "work", "Description")
        self.assertEqual(event.name, "Test")
        self.assertEqual(event.duration, 60)
        self.assertEqual(event.daily, True)
        self.assertEqual(event.start_time_preference, "Early")

    @patch('sys.stdout')
    def test_infeasible_late_event(self, mock_stdout):
        """Test infeasible late event placement."""
        request = self.make_request(
            days=1,
            windows=[(0, 1320, True)],
            unscheduled=[("BigTask", 120, 1, False, "Late", "Library", "study", "Studying")]
        )
        _, result = self.build_and_solve(request)
        self.assertEqual(result, [])
        mock_stdout.write.assert_called()

    @patch('sys.stdout')
    def test_infeasible_place_event(self, mock_stdout):
        """Test infeasible place event."""
        request = self.make_request(
            days=1,
            windows=[(0, 1320, True)],
            unscheduled=[("BigTask", 120, 1, False, "None", "Library", "study", "Studying")]
        )
        _, result = self.build_and_solve(request)
        self.assertEqual(result, [])
        mock_stdout.write.assert_called()

    @patch('sys.stdout')
    def test_infeasible_daily_event(self, mock_stdout):
        """Test infeasible daily event on one day."""
        request = self.make_request(
            days=2,
            windows=[(0, 1320, True)],
            unscheduled=[("BigTask", 120, 1, True, "None", "Library", "study", "Studying")]
        )
        _, result = self.build_and_solve(request)
        self.assertEqual(result, [])
        mock_stdout.write.assert_called()

    def test_overlapping_scheduled_events(self):
        """Test handling of overlapping scheduled events."""
        request = self.make_request(
            days=1,
            windows=[(0, 300, True)],
            unscheduled=[("Task", 60, 1, False, "None", "Library", "study", "Studying")]
        )
        scheduled = [(0, 120, "A"), (60, 180, "B")]
        _, result = self.build_and_solve(request, scheduled)
        self.assertEqual(len(result), 1)


    def test_daily_late_event(self):
        """Test daily event with late preference."""
        request = self.make_request(
            days=2,
            windows=[(0, 300, True), (600, 900, True)],
            unscheduled=[("LateDaily", 60, 1, True, "Late", "Library", "study", "Studying")]
        )
        _, result = self.build_and_solve(request)
        self.assertEqual(len(result), 2)

    @patch('sys.stdout')
    def test_print_days(self, mock_stdout):
        """Test print_days method."""
        request = self.make_request(
            days=2,
            windows=[(540, 600, True)],
            unscheduled=[("Task", 30, 1, False, "None", "Library", "study", "Studying")]
        )
        scheduler, _ = self.build_and_solve(request)
        scheduler.print_days()
        mock_stdout.write.assert_called()

    def test_create_output_with_events(self):
        """Test create_output with unscheduled events."""
        request = self.make_request(
            days=1,
            windows=[(540, 600, True)],
            unscheduled=[("Task", 30, 1, False, "None", "Library", "study", "Studying")]
        )
        scheduler, _ = self.build_and_solve(request)
        output = scheduler.create_output()
        self.assertEqual(len(output), 1)
        self.assertIsInstance(output[0][2], datetime.date)

    def test_abs_mins_to_time_method(self):
        """Test the _abs_mins_to_time method"""
        from scheduler.services.schedule_generator import Event
        event = Event(True, 0, 0, "test")
        result = event._abs_mins_to_time(90)
        self.assertEqual(result, "1:30")

    def test_place_event_in_latest_slot_returns_false_when_no_slot(self):
        """Test _place_event_in_latest_slot_on_day returns False when no slot found"""
        from scheduler.services.schedule_generator import Scheduler, UnscheduledEvent, Day
        request = self.make_request(days=1, windows=[])
        scheduler = Scheduler(request, [])
        
        day = Day(0)
        event = UnscheduledEvent(True, "blocker", 1440, 1, True, "None", "test", "test", "test", 0, 1440)
        day.add_event(event)

        unsched_event = UnscheduledEvent(False, "test", 60, 1, False, "None", "test", "test", "test")
        result = scheduler._place_event_in_latest_slot_on_day(unsched_event, day)
        self.assertFalse(result)

    def test_try_find_all_slots_handles_overlapping_events(self):
        """Test _try_find_all_slots_for_event handles overlapping events."""
        from scheduler.services.schedule_generator import Scheduler, UnscheduledEvent
        request = self.make_request(days=1, windows=[])
        scheduler = Scheduler(request, [])
        
        events_list = [
            (0, UnscheduledEvent(True, "event1", 60, 1, True, "None", "test", "test", "test", 0, 60)),
            (30, UnscheduledEvent(True, "event2", 60, 1, True, "None", "test", "test", "test", 30, 90))
        ]
        
        unsched_event = UnscheduledEvent(False, "test", 30, 1, False, "None", "test", "test", "test")
        slots = scheduler._try_find_all_slots_for_event(unsched_event, events_list)
        
        self.assertTrue(len(slots) > 0)
        self.assertGreaterEqual(slots[0][0], 90)

