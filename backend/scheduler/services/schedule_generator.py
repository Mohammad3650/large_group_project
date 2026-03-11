from ortools.sat.python import cp_model
from typing import List, Tuple
from scheduler.services.request_parser import ParsedScheduleRequest



class Scheduler:
    """
    Constrains based scheduler using OR-Tools CP-SAT.

    Inputs:
        days - no. of days in planning horizon.
            The solvers domain is [0, 24*60*days]
        
        windows - Allowed timed windows during which unscheduled events may start.
            Format: (start_min, end_min, daily) in absolute minutes since day 0.
            Example: If the user allows events scheduled between 9AM - 5PM on day 2 -> (1980, 2460)
        
        scheduled - Fixed events already placed on the calendar.
            Format: (start_min, end_min, name) in absolute minutes since day 0.
            Example: If the user has a lecture from 10AM - 12PM on day 2 -> (2040, 2220, "FC2 lecture")
        
        unscheduled - Sessions to take place that the scheduler will assign times to.
            Format: (duration_mins, name)
            Example: If the user would like to schedule a 1 hour revision session -> (60, "Revision")
    
    Output:
        Returns:
            - Solutions: List[Tuple(start_min, end_min, duration, name)] - 
                Start and end times in minutes for all events in 'unscheduled' input.
            - [] 
                If no feasible solution found or if `unscheduled` is empty.
        
    Notes: 
        - All unscheduled sessions must start within exactly one window
        - All intervals (scheduled and unscheduled) are non-overlapping
    """    
    
    def __init__(self, request: ParsedScheduleRequest, scheduled: List[Tuple[int, int, str]]):
        # Problem inputs
        self.request = request
        self.days = request.days
        self.windows = self.create_daily_window(request.windows)
        self.scheduled = scheduled
        self.unscheduled = request.unscheduled

        # Internal model state
        self.intervals = [] # intervals are IntervalVar objects which represent scheduled and unscheduled time slots
        self.newSessions = [] # Tuples storing newly created IntervalVar objects from unscheduled events for debugging
        self.objectives = []

        self.model = cp_model.CpModel()
        self.solver = None
        self.status = None

    def create_daily_window(self, windows):
        new_windows = []
        for w in windows:
            start, end, daily = w
            if daily:
                for i in range(self.days):
                    offset = i * 1440
                    new_windows.append((start + offset, end + offset))
            else:
                # Non-daily windows are assumed already absolute
                new_windows.append((start, end))
        return new_windows

    def create_scheduled_intervals(self):
        """Create fixed intervals for pre-scheduled events."""
        for l in self.scheduled:
            lecture = self.model.NewIntervalVar(l[0], l[1] - l[0], l[1], l[2])
            self.intervals.append(lecture)

    def create_unscheduled_intervals(self):
        """Create decision intervals for unscheduled events to be placed by the solver.
            Decision intervals are IntervalVar objects with 'start' and 'end' 
            variables to be decided by the solver"""
        for ev in self.unscheduled:
            created = []
            daily = ev[3]
            frequency = ev[2]
            preference = ev[4]
            location = ev[5]
            block_type = ev[6]
            description = ev[7]

            if daily:
                frequency = self.days
            
            for i in range(frequency):

                # Decision variables
                start = self.model.NewIntVar(0, 1440 * self.days, f"{ev[1]}_{i}_start")
                end = self.model.NewIntVar(0, 1440 * self.days, f"{ev[1]}_{i}_end")

                event = self.model.NewIntervalVar(start, ev[0], end, f"{ev[1]}_{i}_session")
                self.intervals.append(event)

                # Enforce that the session starts in only one allowed window
                in_window = []
                for w, (ws, we) in enumerate(self.windows):
                    b = self.model.NewBoolVar(f"{ev[1]}_{i}_inw{w}")
                    in_window.append(b)

                    self.model.Add(start >= ws).OnlyEnforceIf(b)
                    self.model.Add(start <= we - ev[0]).OnlyEnforceIf(b)

                self.model.Add(sum(in_window) == 1)

                self.newSessions.append((start, end, ev[0], ev[1], location, block_type, description))
                created.append(self.newSessions[-1])
                
                if preference == "Early":
                    self.eventStartBiasConstrains((start, end, ev[0], ev[1], location, block_type, description), 1)
                elif preference == "Late":
                    self.objectives.append(self.eventStartBiasConstrains((start, end, ev[0], ev[1], location, block_type, description), -1))
            
            if daily:
                self.reccurOncePerDayConstraint(created)
            
    
    def overlapConstraints(self):
        """Prevent any overlaps between all scheduled and newly created intervals."""
        self.model.AddNoOverlap(self.intervals)

    def evenlySpreadOverRangeConstraint(self, include_scheduled):
        """
        Evenly distribute sessions across days.
        Calculates frequency of sessions per day and returns (max - min).
        If include_scheduled is True, fixed scheduled sessions are also included in the daily counts.
        """
        DAY_MINS = 1440
        n = len(self.newSessions) if not include_scheduled else (len(self.newSessions) + len(self.intervals))

        # Get day number for each unscheduled event
        day_idxs = []
        for (start, _, _, name, _, _, _) in self.newSessions:
            day_idx = self.model.NewIntVar(0, self.days - 1, f"{name}_day_idx")
            self.model.AddDivisionEquality(day_idx, start, DAY_MINS)
            day_idxs.append(day_idx)
        
        # Optional: Get day number for each scheduled event
        if include_scheduled:
            for (start, _, name) in self.scheduled:
                day_idx = self.model.NewIntVar(0, self.days - 1, f"{name}_day_idx")
                day = start//1440
                self.model.Add(day_idx == day)
                day_idxs.append(day_idx)

        # Count number of sessions per day
        counts = []
        for day in range(self.days):
            res = []
            for i, day_idx in enumerate(day_idxs):
                b = self.model.NewBoolVar(f"s{i}_is_day{day}")
                self.model.Add(day_idx == day).OnlyEnforceIf(b)
                self.model.Add(day_idx != day).OnlyEnforceIf(b.Not())
                res.append(b)
        
            count_d = self.model.NewIntVar(0, n, f"count_day{day}")
            self.model.Add(count_d == sum(res))
            counts.append(count_d)
        
        # Find maximum and minimum counts
        max_count = self.model.NewIntVar(0, n, "max_count")
        min_count = self.model.NewIntVar(0, n, "min_count")
        self.model.AddMaxEquality(max_count, counts)
        self.model.AddMinEquality(min_count, counts)

        return (max_count - min_count)    

    def reccurOncePerDayConstraint(self, recurringEvents):
        """Enforces that recurring events of one type must only appear once per day"""
        DAY_MINS = 1440
        n = len(recurringEvents)

        if n > self.days:
            print("Too many days")
            return

        # Get day number for each unscheduled event
        day_idxs = []
        for (start, _, _, name, _, _, _) in recurringEvents:
            day_idx = self.model.NewIntVar(0, self.days - 1, f"{name}_day_idx")
            self.model.AddDivisionEquality(day_idx, start, DAY_MINS)
            day_idxs.append(day_idx)

        # Count number of sessions per day
        counts = []
        for d in range(self.days):
            # one boolean per session: (day_idx == d)
            res = []
            for i, day_idx in enumerate(day_idxs):
                b = self.model.NewBoolVar(f"{name}_{i}_is_day{d}")
                self.model.Add(day_idx == d).OnlyEnforceIf(b)
                self.model.Add(day_idx != d).OnlyEnforceIf(b.Not())
                res.append(b)

            count_d = self.model.NewIntVar(0, n, f"count_day{d}")
            self.model.Add(count_d == sum(res))
            self.model.Add(count_d <= 1)
            counts.append(count_d)

    def eventStartBiasConstrains(self, event, weight = 1):
        """
        Bias the scheduler to select latest start time for a given event
        Positive weight - early, 
        Negative weight = late
        """
        DAY_MINS = 1440
        
        day_idx = self.model.NewIntVar(0, self.days - 1, f"{event[3]}_day_idx")
        self.model.AddDivisionEquality(day_idx, event[0], DAY_MINS)
        
        start_in_day = self.model.NewIntVar(0, DAY_MINS - 1, f"{event[3]}_start_in_day")
        self.model.Add(start_in_day == event[0] - day_idx * DAY_MINS)
        return weight * start_in_day

    def applyConstraints(self):
        """Apply the configuration of constraints"""
        
        if self.request.even_spread:
            self.objectives.append(1440 * self.evenlySpreadOverRangeConstraint(self.request.include_scheduled))
        
        self.model.Minimize(sum(self.objectives))

    def _startSolver(self):
        """Instantiate and run the solver."""
        self.solver = cp_model.CpSolver()
        self.status = self.solver.Solve(self.model)

    def solve(self):
        """Solve the model and return solutions list"""
        """self._startSolver(self.model)"""""
        self._startSolver()

        if self.status not in (cp_model.OPTIMAL, cp_model.FEASIBLE):
            print("No feasible schedule.")
            return []
        else:
            return [ ( self.solver.Value(s), self.solver.Value(e), d, n, loc, bt, desc) for (s, e, d, n, loc, bt, desc) in self.newSessions ]
    
    def debugOutput(self):
        """Verbose output of newly created sessions"""
        if self.status == None:
            print("Status -> None")
            return

        for i, (start, end, duration, name, location, block_type, description) in enumerate(self.newSessions):
            s = self.solver.Value(start)
            e = self.solver.Value(end)
            print(f"Session {i+1} ; {name} @ {location} ({block_type}): {s} - {e} ; {duration}")

#EXAMPLE USEAGE
# days = 1
# windows = [
    # (hm_to_min("08:00"), hm_to_min("11:00"))
    # (hm_to_min("13:30"), hm_to_min("18:"))
    # ]
# scheduled = [
    # start, end, name
    # (hm_to_min("10:00"), hm_to_min("11:00"), "lecture 1")
    # (hm_to_min("14:00"), hm_to_min("14:55"), "lecture 2")
    # ]
# unscheduled = [
    #     duration, name
    #     (60, "gym"),
    #     (120, "FC2 Revision"),
    #     (45, "SEG meeting")
    # ]

# --- Most of this can be abstracted away making the process simpler ----
# scheduler = Scheduler(days, windows, scheduled, unscheduled)
# scheduler.create_scheduled_intervals()
# scheduler.create_unscheduled_intervals()
# scheduler.overlapConstraints()
# scheduler.earlyBiasConstrains()
# scheduler.solve()
# scheduler.debugOutput()