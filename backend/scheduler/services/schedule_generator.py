from ortools.sat.python import cp_model
from typing import List, Tuple
from scheduler.services.request_parser import ParsedScheduleRequest

DAY_MINS = 1440
PREFERENCE_WEIGHTS = {"Early": 1, "Late": -1}

class Scheduler:
    """
    Constrains based scheduler using OR-Tools CP-SAT.

    Assigns unscheduled events to time slots while respecting fixed events,
    allowed time windows, and user preferences. All times in minutes since day 0.
    """    
    
    def __init__(self, request: ParsedScheduleRequest, scheduled: List[Tuple[int, int, str]]):
        self.request = request
        self.days = request.days
        self.windows = self.create_daily_window(request.windows)
        self.scheduled = scheduled
        self.unscheduled = request.unscheduled

        self.intervals = []
        self.new_sessions = []
        self.objectives = []

        self.model = cp_model.CpModel()
        self.solver = None
        self.status = None

    def create_daily_window(self, windows):
        """
        Expand windows into daily intervals if specified.

        Args:
            windows: List of tuples (start, end, daily) where daily is a bool.

        Returns:
            List of expanded window intervals as (start, end) tuples.
        """
        expanded = []
        for start, end, daily in windows:
            expanded.extend(self._expand_window(start, end, daily))
        return expanded
 
    def _expand_window(self, start, end, daily):
        """
        Expand a single window across all days if daily is True.

        Args:
            start: Start time in minutes.
            end: End time in minutes.
            daily: Boolean indicating if the window repeats daily.

        Returns:
            List of (start, end) tuples for the window(s).
        """
        if not daily:
            return [(start, end)]
        return [(start + i * DAY_MINS, end + i * DAY_MINS) for i in range(self.days)]

    def create_scheduled_intervals(self):
        """Create fixed intervals for pre-scheduled events"""
        for start, end, name in self.scheduled:
            interval = self.model.NewIntervalVar(start, end - start, end, name)
            self.intervals.append(interval)

    def create_unscheduled_intervals(self):
        """Create decision intervals for unscheduled events"""
        for duration, name, frequency, daily, preference, location, block_type, description in self.unscheduled:
            frequency = self.days if daily else frequency
            sessions = self._create_sessions(name, duration, frequency, location, block_type, description)
            self._apply_preference(sessions, preference)
            if daily:
                self.recur_once_per_day_constraint(sessions)
    
    def _create_sessions(self, name, duration, frequency, location, block_type, description):
        """
        Create and register all sessions for one unscheduled event type.

        Args:
            name: Name of the event.
            duration: Duration in minutes.
            frequency: Number of sessions to create.
            location: Location of the event.
            block_type: Type of the block.
            description: Description of the event.

        Returns:
            List of session tuples.
        """
        sessions = []
        for i in range(frequency):
            start, end, _ = self._create_decision_variables(name, duration, i)
            session = (start, end, duration, name, location, block_type, description)
            self.new_sessions.append(session)
            sessions.append(session)
        return sessions
    
    def _apply_preference(self, sessions, preference):
        """
        Register start-time bias objectives for Early/Late preferences.

        Args:
            sessions: List of session tuples.
            preference: String preference ("Early" or "Late").
        """
        weight = PREFERENCE_WEIGHTS.get(preference)
        if weight is None:
            return
        for session in sessions:
            self.objectives.append(self.event_start_bias_constraints(session, weight))

    def _create_decision_variables(self, name, duration, i):
        """
        Create start/end/interval vars and enforce window membership.

        Args:
            name: Name of the event.
            duration: Duration in minutes.
            i: Index of the session.

        Returns:
            Tuple of (start, end, event) variables.
        """
        total_mins = DAY_MINS * self.days
        start = self.model.NewIntVar(0, total_mins, f"{name}_{i}_start")
        end = self.model.NewIntVar(0, total_mins, f"{name}_{i}_end")
        event = self.model.NewIntervalVar(start, duration, end, f"{name}_{i}_session")
        self.intervals.append(event)
        self._apply_window_constraints(name, i, start, duration)
        return start, end, event
 
    def _apply_window_constraints(self, name, i, start, duration):
        """
        Enforce that a session falls in exactly one allowed window.

        Args:
            name: Name of the event.
            i: Index of the session.
            start: Start time variable.
            duration: Duration in minutes.
        """
        in_window = [
            self._make_window_bool(name, i, w, ws, we, start, duration)
            for w, (ws, we) in enumerate(self.windows)
        ]
        self.model.Add(sum(in_window) == 1)
 
    def _make_window_bool(self, name, i, w, ws, we, start, duration):
        """
        Create and return a bool var indicating membership in one window.

        Args:
            name: Name of the event.
            i: Index of the session.
            w: Window index.
            ws: Window start time.
            we: Window end time.
            start: Start time variable.
            duration: Duration in minutes.

        Returns:
            Boolean variable indicating if the session is in the window.
        """
        b = self.model.NewBoolVar(f"{name}_{i}_inw{w}")
        self.model.Add(start >= ws).OnlyEnforceIf(b)
        self.model.Add(start <= we - duration).OnlyEnforceIf(b)
        return b

    def overlap_constraints(self):
        """ Prevent overlaps involving unscheduled events. """
        num_scheduled = len(self.scheduled)
        scheduled_intervals = self.intervals[:num_scheduled]
        unscheduled_intervals = self.intervals[num_scheduled:]

        if len(unscheduled_intervals) > 1:
            self.model.AddNoOverlap(unscheduled_intervals)

        for sched_iv in scheduled_intervals:
            self._add_no_overlap_with_unscheduled(sched_iv, unscheduled_intervals)
    
    def _add_no_overlap_with_unscheduled(self, sched_iv, unscheduled_intervals):
        """
        Ensure a scheduled interval does not overlap with any unscheduled ones.

        Args:
            sched_iv: Scheduled interval variable.
            unscheduled_intervals: List of unscheduled interval variables.
        """
        for unsched_iv in unscheduled_intervals:
            self.model.AddNoOverlap([sched_iv, unsched_iv])

    def evenly_spread_over_range_constraint(self, include_scheduled):
        """
        Evenly distribute sessions across days.

        Args:
            include_scheduled: Boolean to include scheduled events in the count.

        Returns:
            Integer variable representing (max_count - min_count) to be minimized.
        """
        length = len(self.new_sessions) + (len(self.intervals) if include_scheduled else 0)
        day_idxs = self._collect_day_indices(include_scheduled)
        counts = self._count_sessions_per_day(day_idxs, length)
        max_count, min_count = self._get_max_min_counts(length, counts)
        return (max_count - min_count)   

    def _collect_day_indices(self, include_scheduled):
        """
        Collect day indices for all sessions, including scheduled ones.

        Args:
            include_scheduled: Boolean to include scheduled events.

        Returns:
            List of day index variables.
        """
        day_idxs = []
        self._get_unscheduled_day_numbers(day_idxs)
        if include_scheduled:
            self._get_scheduled_day_numbers(day_idxs)
        return day_idxs
    
    def _count_sessions_per_day(self, day_idxs, length):
        """
        Count sessions per day and create integer variables for the counts.

        Args:
            day_idxs: List of day index variables.
            length: Maximum possible count.

        Returns:
            List of count variables per day.
        """
        counts = []
        for day in range(self.days):
            bools = self._count_events_per_day(day, day_idxs)
            count_d = self.model.NewIntVar(0, length, f"count_day{day}")
            self.model.Add(count_d == sum(bools))
            counts.append(count_d)
        return counts

    def _make_day_idx_var(self, start, name):
        """
        Create a variable representing the day index for a given start time.

        Args:
            start: Start time variable.
            name: Name of the event.

        Returns:
            Day index variable.
        """
        day_idx = self.model.NewIntVar(0, self.days - 1, f"{name}_day_idx")
        self.model.AddDivisionEquality(day_idx, start, DAY_MINS)
        return day_idx

    def _get_unscheduled_day_numbers(self, index_list):
        """
        Append day indices for all unscheduled sessions to the list.

        Args:
            index_list: List to append day indices to.
        """
        for (start, _, _, name, _, _, _) in self.new_sessions:
            index_list.append(self._make_day_idx_var(start, name))
    
    def _get_scheduled_day_numbers(self, index_list):
        """
        Append day indices for all scheduled events to the list.

        Args:
            index_list: List to append day indices to.
        """
        for (start, _, name) in self.scheduled:
            index_list.append(self._make_day_idx_var(start, name))
    
    def _count_events_per_day(self, day, index_list):
        """
        Create boolean variables indicating if each event is on the given day.

        Args:
            day: Day index.
            index_list: List of day index variables.

        Returns:
            List of boolean variables.
        """
        bools = []
        for i, day_idx in enumerate(index_list):
            bool_var = self.model.NewBoolVar(f"s{i}_is_day{day}")
            self.model.Add(day_idx == day).OnlyEnforceIf(bool_var)
            self.model.Add(day_idx != day).OnlyEnforceIf(bool_var.Not())
            bools.append(bool_var)
        return bools
    
    def _get_max_min_counts(self, length, counts):
        """
        Create variables for the maximum and minimum session counts per day.

        Args:
            length: Maximum possible count.
            counts: List of count variables per day.

        Returns:
            Tuple of (max_count, min_count) variables.
        """
        max_count = self.model.NewIntVar(0, length, "max_count")
        min_count = self.model.NewIntVar(0, length, "min_count")
        self.model.AddMaxEquality(max_count, counts)
        self.model.AddMinEquality(min_count, counts)
        return max_count, min_count

    def recur_once_per_day_constraint(self, recurring_events):
        """
        Enforces that recurring events of one type appear at most once per day.

        Args:
            recurring_events: List of recurring event sessions.
        """
        if len(recurring_events) > self.days:
            return
        day_idxs = []
        self._get_unscheduled_day_numbers(day_idxs)
        self._enforce_max_one_per_day(day_idxs, len(recurring_events))
    
    def _enforce_max_one_per_day(self, day_idxs, n):
        """
        Ensure at most one event per day for recurring events.

        Args:
            day_idxs: List of day index variables.
            n: Number of events.
        """
        for day in range(self.days):
            bools = self._count_events_per_day(day, day_idxs)
            count_d = self.model.NewIntVar(0, n, f"count_day{day}")
            self.model.Add(count_d == sum(bools))
            self.model.Add(count_d <= 1)

    def event_start_bias_constraints(self, event, weight=1):
        """
        Bias the scheduler toward early (weight=1) or late (weight=-1) starts.
        """
        start, _, _, name, *_ = event
        day_idx = self._make_day_idx_var(start, name)
        start_in_day = self.model.NewIntVar(0, DAY_MINS - 1, f"{name}_start_in_day")
        self.model.Add(start_in_day == start - day_idx * DAY_MINS)
        return weight * start_in_day

    def apply_constraints(self):
        """Apply the configuration of constraints"""
        if self.request.even_spread:
            self.objectives.append(DAY_MINS * self.evenly_spread_over_range_constraint(self.request.include_scheduled))
        self.model.Minimize(sum(self.objectives))

    def _start_solver(self):
        """Instantiate and run the solver"""
        self.solver = cp_model.CpSolver()
        self.status = self.solver.Solve(self.model)

    def solve(self):
        """
        Solve the model and return solutions list.

        Returns:
            List of scheduled session tuples (start, end, date, name, location, block_type, description).
        """
        self._start_solver()

        if self.status not in (cp_model.OPTIMAL, cp_model.FEASIBLE):
            return []
        else:
            return [ 
                (self.solver.Value(start), self.solver.Value(end), date, name, location, block_type, description) 
                for (start, end, date, name, location, block_type, description) in self.new_sessions ]
    
    def debug_output(self):
        """Verbose output of newly created sessions"""
        if self.status is None:
            print("Status -> None")
            return

        for i, (start, end, duration, name, location, block_type, description) in enumerate(self.new_sessions):
            block_start = self.solver.Value(start)
            block_end = self.solver.Value(end)
            print(f"Session {i+1} ; {name} @ {location} ({block_type}): {block_start} - {block_end} ; {duration}")