from ortools.sat.python import cp_model
from typing import List, Tuple
from utils import TimeUtils


class Scheduler:
    """
    Constrains based scheduler using OR-Tools CP-SAT.

    Inputs:
        days - no. of days in planning horizon.
            The solvers domain is [0, 24*60*days]
        
        windows - Allowed timed windows during which unsheduled events may start.
            Format: (start_min, end_min) in absolute minutes since day 0.
            Example: If the user allows events scheduled between 9AM - 5PM on day 2 -> (1980, 2460)
        
        scheduled - Fixed events already placed on the calendar.
            Format: (start_min, end_min, name) in absolute minutes since day 0.
            Example: If the user has a lecture from 10AM - 12PM on day 2 -> (2040, 2220, "FC2 lecture")
        
        unscheduled - Sessions to take place that the sheduler will assign times to.
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
    def __init__(self, days: int, windows: List[Tuple[int, int]], scheduled: List[Tuple[int, int, str]], unscheduled: List[Tuple[int, str]]):
        # Problem inputs
        self.days = days
        self.windows = windows
        self.scheduled = scheduled
        self.unscheduled = unscheduled

        # Internal model state
        self.intervals = [] # intervals are IntervalVar objects which represent scheduled time slots
        self.newSessions = [] # Tuples storing newly created IntervalVar objects from unscheduled events for debugging

        self.model = cp_model.CpModel()
        self.solver = None
        self.status = None

    def create_scheduled_intervals(self):
        """Create fixed intervals for pre-scheduled events."""
        for l in self.scheduled:
            lecture = self.model.NewIntervalVar(l[0], l[1] - l[0], l[1], l[2])
            self.intervals.append(lecture)

    def create_unscheduled_intervals(self):
        """Create decision intervals for sessions to be placed by the solver.
            Decision intervals are IntervalVar objects with 'start' and 'end' 
            variables to be decided by the solver"""
        for ev in self.unscheduled:
            # Decision variables
            start = self.model.NewIntVar(0, 24 * 60 * self.days, f"{ev[1]}_start")
            end = self.model.NewIntVar(0, 24 * 60 * self.days, f"{ev[1]}_end")
            # self.model.Add(end == start + ev[0])

            event = self.model.NewIntervalVar(start, ev[0], end, f"{ev[1]}_session")
            self.intervals.append(event)

            # Enforce that the session starts in only one allowed window
            in_window = []
            for w, (ws, we) in enumerate(self.windows):
                b = self.model.NewBoolVar(f"{ev[1]}_inw{w}")
                in_window.append(b)

                self.model.Add(start >= ws).OnlyEnforceIf(b)
                self.model.Add(start <= we - ev[0]).OnlyEnforceIf(b)

            self.model.Add(sum(in_window) == 1)

            self.newSessions.append((start, end, ev[0], ev[1]))
    
    def overlapConstraints(self):
        """Prevent any overlaps between all scheduled and newly created intervals."""
        self.model.AddNoOverlap(self.intervals)

    def earlyBiasConstraints(self):
        """Bias the scheduler to select earliest start times"""
        self.model.Minimize(sum(s[0] for s in self.newSessions))
    
    def lateBiasConstraints(self):
        """Bias the scheduler to select latest start times"""
        self.model.Maximize(sum(s[0] for s in self.newSessions))

    def _startSolver(self):
        """Instantiate and run the solver."""
        self.solver = cp_model.CpSolver()
        self.status = self.solver.Solve(self.model)

    def solve(self):
        """Solve the model and return solutions list"""
        self._startSolver()

        if self.status not in (cp_model.OPTIMAL, cp_model.FEASIBLE):
            print("No feasible schedule.")
            return []
        else:
            return [(self.solver.Value(s), self.solver.Value(e), d, n) for (s, e, d, n) in self.newSessions]
    
    def debugOutput(self):
        """Verbose output of newly created sessions"""
        if self.status == None:
            print("Status -> None")
            return

        for i, (start, end, duration, name) in enumerate(self.newSessions):
            s = self.solver.Value(start)
            e = self.solver.Value(end)
            print(f"Session {i+1} ; {name}: {s} - {e} ; {duration}")

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