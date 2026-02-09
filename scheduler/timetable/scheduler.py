from ortools.sat.python import cp_model
from typing import List, Tuple

class Scheduler:
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
        self._startSolver(self.model)

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