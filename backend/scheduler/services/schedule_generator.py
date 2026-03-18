from ortools.sat.python import cp_model
from typing import List, Tuple
from scheduler.services.request_parser import ParsedScheduleRequest



class Scheduler:
    """
    Constrains based scheduler using OR-Tools CP-SAT.

    Assigns unscheduled events to time slots while respecting fixed events,
    allowed time windows, and user preferences. All times in minutes since day 0.
    """    
    
    def __init__(self, request: ParsedScheduleRequest, scheduled: List[Tuple[int, int, str]]):
        # Problem inputs
        self.request = request
        self.days = request.days
        self.windows = self.createDailyWindow(request.windows)
        self.scheduled = scheduled
        self.unscheduled = request.unscheduled

        # Internal model state
        self.intervals = [] # intervals are IntervalVar objects which represent scheduled and unscheduled time slots
        self.newSessions = [] # Tuples storing newly created IntervalVar objects from unscheduled events for debugging
        self.objectives = []

        self.model = cp_model.CpModel()
        self.solver = None
        self.status = None

    def createDailyWindow(self, windows):
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

    def createScheduledIntervals(self):
        """Create fixed intervals for pre-scheduled events."""
        for l in self.scheduled:
            lecture = self.model.NewIntervalVar(l[0], l[1] - l[0], l[1], l[2])
            self.intervals.append(lecture)

    def createUnscheduledIntervals(self):
        """Create decision intervals for unscheduled events to be placed by the solver.
            Decision intervals are IntervalVar objects with 'start' and 'end' 
            variables to be decided by the solver"""
        for ev in self.unscheduled:
            created = []
            duration, name, frequency, daily, preference, location, block_type, description = ev
            frequency = self.days if daily else frequency
            
            for i in range(frequency):
                start, end, event = self._createDecisionVariables(name, duration, i)
                
                self.newSessions.append((start, end, duration, name, location, block_type, description))
                created.append(self.newSessions[-1])

                if preference == "Early":
                    self.objectives.append(self.eventStartBiasConstrains((start, end, duration, name, location, block_type, description), 1))
                elif preference == "Late":
                    self.objectives.append(self.eventStartBiasConstrains((start, end, duration, name, location, block_type, description), -1))
            
            if daily:
                self.reccurOncePerDayConstraint(created)

    def _createDecisionVariables(self, name, duration, i):
        start = self.model.NewIntVar(0, 1440 * self.days, f"{name}_{i}_start")
        end = self.model.NewIntVar(0, 1440 * self.days, f"{name}_{i}_end")
        event = self.model.NewIntervalVar(start, duration, end, f"{name}_{i}_session")
        self.intervals.append(event)

        # Enforce that the session starts in only one allowed window
        in_window = []
        for w, (ws, we) in enumerate(self.windows):
            b = self.model.NewBoolVar(f"{name}_{i}_inw{w}")
            in_window.append(b)

            self.model.Add(start >= ws).OnlyEnforceIf(b)
            self.model.Add(start <= we - duration).OnlyEnforceIf(b)

        self.model.Add(sum(in_window) == 1)

        return start, end, event

    def overlapConstraints(self):
        """Prevent any overlaps between all scheduled and newly created intervals."""
        self.model.AddNoOverlap(self.intervals)

    def evenlySpreadOverRangeConstraint(self, include_scheduled):
        """
        Evenly distribute sessions across days.
        Calculates frequency of sessions per day and returns (max - min).
        If include_scheduled is True, fixed scheduled sessions are also included in the daily counts.
        """
        n = len(self.newSessions) if not include_scheduled else (len(self.newSessions) + len(self.intervals))
        # Get day number for each unscheduled event
        day_idxs = []
        self._getunscheduledDayNumbers(day_idxs)

        # Optional: Get day number for each scheduled event
        if include_scheduled:
            self._getScheduledDayNumbers(day_idxs)

        # Count number of sessions per day
        counts = []
        for day in range(self.days):
            res = self._countEventsPerDay(day, day_idxs)
            count_d = self.model.NewIntVar(0, n, f"count_day{day}")
            self.model.Add(count_d == sum(res))
            counts.append(count_d)
        
        # Find maximum and minimum counts
        max_count, min_count = self._getMaxMinCounts(n, counts)
        return (max_count - min_count)    


    def _getunscheduledDayNumbers(self, indexList):
        DAY_MINS = 1440
        for (start, _, _, name, _, _, _) in self.newSessions:
            day_idx = self.model.NewIntVar(0, self.days - 1, f"{name}_day_idx")
            self.model.AddDivisionEquality(day_idx, start, DAY_MINS)
            indexList.append(day_idx)
    
    def _getScheduledDayNumbers(self, indexList):
        DAY_MINS = 1440
        for (start, _, name) in self.scheduled:
            day_idx = self.model.NewIntVar(0, self.days - 1, f"{name}_day_idx")
            self.model.AddDivisionEquality(day_idx, start, DAY_MINS)
            indexList.append(day_idx)
    
    def _countEventsPerDay(self, day, indexList):
        res = []
        for i, day_idx in enumerate(indexList):
            b = self.model.NewBoolVar(f"s{i}_is_day{day}")
            self.model.Add(day_idx == day).OnlyEnforceIf(b)
            self.model.Add(day_idx != day).OnlyEnforceIf(b.Not())
            res.append(b)
        return res
    
    def _getMaxMinCounts(self, length, counts):
        max_count = self.model.NewIntVar(0, length, "max_count")
        min_count = self.model.NewIntVar(0, length, "min_count")
        self.model.AddMaxEquality(max_count, counts)
        self.model.AddMinEquality(min_count, counts)
        return max_count, min_count


    def reccurOncePerDayConstraint(self, recurringEvents):
        """Enforces that recurring events of one type must only appear once per day"""
        DAY_MINS = 1440
        n = len(recurringEvents)

        if n > self.days:
            return
        
        # Get day number for each unscheduled event
        day_idxs = []
        self._getunscheduledDayNumbers(day_idxs)

        # Count number of sessions per day
        for day in range(self.days):
            # one boolean per session: (day_idx == d)
            res = self._countEventsPerDay(day, day_idxs)

            count_d = self.model.NewIntVar(0, n, f"count_day{day}")
            self.model.Add(count_d == sum(res))
            self.model.Add(count_d <= 1)


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