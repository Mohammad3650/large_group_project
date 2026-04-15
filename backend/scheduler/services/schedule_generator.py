import bisect
import datetime
from datetime import time
from .constants import DAY_MINS, MINS_IN_HOUR

FINAL_MIN = 1439
LATE_PREFERENCE = "Late"
WINDOW_EVENT_NAME = "window"

class Event:
    def __init__(self, scheduled, start_time = None, end_time = None, name = None):
        """
        Initialize Event.
        Args:
            scheduled (bool): If scheduled.
            start_time (int, optional): Start time in mins.
            end_time (int, optional): End time in mins.
            name (str, optional): Event name.
        """
        self.start_time = start_time
        self.end_time = end_time
        self.name = name
        self.scheduled = scheduled
    
    def __str__(self):
        """
        String representation.
        Returns: str: Event details.
        """
        return f"start: {self.start_time_dt}, end: {self.end_time_dt}, name: {self.name}, scheduled: {self.scheduled}"
    
    def __repr__(self):
        """
        Debug representation.
        Returns: str - Same as __str__.
        """
        return self.__str__()
    
    def _abs_mins_to_time(self, abs):
        return f"{abs // MINS_IN_HOUR}:{abs % MINS_IN_HOUR}"

    def _abs_time_to_datetime(self, abs_min: int) -> tuple[str, str]:
        """
        Convert abs mins to time.
        Args:abs_min (int): Abs mins since day 0.
        Returns: time: Time object.
        """
        mins_in_day = abs_min % DAY_MINS

        hour = mins_in_day // MINS_IN_HOUR
        minute = mins_in_day % MINS_IN_HOUR

        return time(hour=hour, minute=minute, second=0)
    
    @property
    def start_time_dt(self):
        """
        Start time as time object.
        Returns: time: Start time.
        """
        return self._abs_time_to_datetime(self.start_time)
    
    @property
    def end_time_dt(self):
        """
        End time as time object.
        Returns: time: End time.
        """
        return self._abs_time_to_datetime(self.end_time)
    
    def __lt__(self, other):
        """
        Compare by end time.
        Args: other (Event): Other event.
        Returns: bool: If self < other.
        """
        return self.end_time < other.end_time

class UnscheduledEvent(Event):
    def __init__(self, scheduled, name, duration, frequency, daily, start_time_preference, location, block_type, description, start_time = None, end_time = None):
        """
        Initialize UnscheduledEvent.
        Args:
            scheduled (bool): If scheduled.
            name (str): Event name.
            duration (int): Duration in mins.
            frequency (int): Frequency.
            daily (bool): If daily.
            start_time_preference (str): Preference.
            location (str): Location.
            block_type (str): Block type.
            description (str): Description.
            start_time (int, optional): Start time.
            end_time (int, optional): End time.
        """
        super().__init__(scheduled, start_time, end_time, name)
        self.duration = duration
        self.frequency = frequency
        self.daily = daily
        self.start_time_preference = start_time_preference
        self.location = location
        self.block_type = block_type
        self.description = description

class Day:
    def __init__(self, relative_start):
        """
        Initialize Day.
        Args: relative_start (int): Relative start in mins.
        """
        self.available = DAY_MINS
        self.relative_start = relative_start
        self.unsched_ev_count = 0
        self.sched_ev_count = 0
        self.events = []
    
    def add_event(self, event):
        """
        Add event to day.
        Args: event (Event): Event to add.
        Returns: None
        """
        bisect.insort(self.events, (event.start_time, event))
        self.available -= (event.end_time - event.start_time)
        if event.scheduled:
            self.sched_ev_count += 1
        else:
            self.unsched_ev_count += 1


class Scheduler:
    def __init__(self, request, scheduled):
        """
        Initialize Scheduler.
        Args: request: Scheduling request.
            scheduled: Scheduled events.
        """
        self.request = request
        self.scheduled = scheduled
        self.days = self.create_days(request.days)

    def create_days(self, days):
        """
        Create day objects.
        Args: days (int): Number of days.
        Returns: list[Day]: List of days.
        """
        created_days = []
        for count in range(days):
            created_days.append(Day(DAY_MINS * count))
        return created_days
    
    def create_daily_windows(self, windows):
        """
        Create daily windows.
        Args: windows (list): List of windows.
        Returns: None
        """
        for start, end, _ in windows:
            self._add_window_to_each_day(start, end)

    def _add_window_to_each_day(self, start, end):
        for day in self.days:
            day.add_event(Event(True, start, end, WINDOW_EVENT_NAME))
    
    # Add scheduled events to the respective days
    def add_scheduled_events(self):
        """
        Add scheduled events.
        Returns: None
        """
        for start, end, name in self.scheduled:
            day_index = start // DAY_MINS
            day = self.days[day_index]
            day.add_event(Event(True, start - day.relative_start, end - day.relative_start, name))

    def _get_ordered_days(self):
        """
        Get ordered days.
        Returns: list[Day]: Ordered days.
        """
        if self.request.even_spread:
            return sorted(
                self.days, 
                key=lambda day: (day.unsched_ev_count) + (day.sched_ev_count if self.request.include_scheduled else 0)
                )
        else:
            return self.days
        
    def _create_unsched_event_object(self, event):
        """
        Create UnscheduledEvent.
        Args: event (tuple): Event data.
        Returns: UnscheduledEvent: Event object.
        """
        return UnscheduledEvent(False, *event)
    
    def _sort_unscheduled_events(self):
        """
        Sort unscheduled events.
        Returns: list: Sorted events.
        """
        events = self.request.unscheduled
        return sorted(
            events,
            key = lambda event: (not event[3], event[4] != LATE_PREFERENCE)
        )
    
    def _place_event_n_times(self, event, frequency, late):
        """Attempt to place a non-daily event `frequency` times."""
        for _ in range(frequency):
            success = self._place_late_event(event) if late else self._place_event(event)
            if not success:
                return False
        return True
    
    def add_unscheduled_events(self):
        """
        Add all unscheduled events. Daily events are placed once per day.
        Non-daily events are placed frequency times using even spread if enabled.
        Returns: bool: False if any event cannot be placed, True otherwise.
        """
        for event in self._sort_unscheduled_events():
            daily = event[3]
            late = event[4] == LATE_PREFERENCE
            frequency = event[2]

            success = self._dispatch_event_placement(event, daily, late, frequency)

            if not success:
                return False

        return True

    def _dispatch_event_placement(self, event, daily, late, frequency):
        if daily:
            success = self._place_daily_event(event, late)
        else:
            success = self._place_event_n_times(event, frequency, late)
        return success
    
    def _place_event_on_day(self, event, day, late):
        """Attempt to place an event on a single day, using latest or earliest slot."""
        event_obj = self._create_unsched_event_object(event)
        if late:
            return self._place_event_in_latest_slot_on_day(event_obj, day)
        return self._try_add_event_to_day(event_obj, day)

    def _place_daily_event(self, event, late):
        """
        Place event once on every day. Fails immediately if any day cannot fit it.
        Args:
            event (tuple): Event data.
            late (bool): Whether to use latest-slot placement.
        Returns: bool: True if placed on all days, False otherwise.
        """
        for day in self.days:
            if not self._place_event_on_day(event, day, late):
                print(f"ERROR: Infeasible. {event} COULD NOT BE PLACED on day")
                return False
        return True
    
    def _add_candidate(self, candidates, start, index):
        """Add the (start, index) pair to the candidates list using insertion sort"""
        if start is not None:
                bisect.insort(candidates, (start, index))
    
    def _collect_late_candidates(self, event):
        """Collect (start_time, day_index) pairs for latest-slot placement across all days."""
        candidates = []
        for index, day in enumerate(self.days):
            event_obj = self._create_unsched_event_object(event)
            start = self._find_latest_slot_for_event(event_obj, day.events)
            self._add_candidate(candidates, start, index)
        return candidates

    def _place_event_at(self, event, start, day_idx):
        """Place an event at a specific start time on a specific day."""
        event_obj = self._create_unsched_event_object(event)
        event_obj.start_time = start
        event_obj.end_time = start + event_obj.duration
        self.days[day_idx].add_event(event_obj)

    def _place_late_event(self, event):
        """
        Find the latest possible slot across all days and place the event there.
        Args: event (tuple): Event data.
        Returns: bool: True if placed, False if no slot found on any day.
        """
        candidates = self._collect_late_candidates(event)

        if not candidates:
            print(f"ERROR: Infeasible. {event} COULD NOT BE PLACED")
            return False

        start, day_idx = candidates[-1]
        self._place_event_at(event, start, day_idx)
        return True

    def _place_event(self, event):
        """
        Place event into the first available slot, using even spread ordering if enabled.
        Args: event (tuple): Event data.
        Returns: bool: True if placed, False if no slot found on any day.
        """
        for day in self._get_ordered_days():
            event_obj = self._create_unsched_event_object(event)
            if self._try_add_event_to_day(event_obj, day):
                return True
        print(f"ERROR: Infeasible. {event} COULD NOT BE PLACED")
        return False

    def _place_event_in_latest_slot_on_day(self, event_obj, day):
        """
        Place an event into the latest available slot on a specific day.
        Args:
            event_obj (UnscheduledEvent): The event to place.
            day (Day): The day to place it on.
        Returns: bool: True if placed, False if no slot found.
        """
        start = self._find_latest_slot_for_event(event_obj, day.events)
        if start is None:
            return False
        event_obj.start_time = start
        event_obj.end_time = start + event_obj.duration
        day.add_event(event_obj)
        return True

    def _try_add_event_to_day(self, unsched_event, day):
        """
        Try to add an unscheduled event to a specific day.
        Args: unsched_event (UnscheduledEvent): The event to add.
            day (Day): The day to add to.
        Returns: bool: True if added successfully, False otherwise.
        """
        found, start = self._try_find_slot_for_event(unsched_event, day.events)
        if found:
            unsched_event.start_time = start
            unsched_event.end_time = start + unsched_event.duration
            day.add_event(unsched_event)
            return True
        else:
            return False
    

    def _try_find_slot_for_event(self, unsched_event, events_list):
        """
        Find the first available time slot for an event in the events list.
        Args: unsched_event (UnscheduledEvent): The event to place.
            events_list (list): List of events on the day.
        Returns: tuple: (bool, int) - True and start time if found, False and None otherwise.
        """
        gap_start = 0
        for i in range(len(events_list)):

            event = events_list[i][1]
            gap = event.start_time - gap_start

            # handle overlapping events
            if gap < 0 and (event.end_time > gap_start):
                gap_start = event.end_time
                continue

            if gap >= unsched_event.duration:
                # Add event to day
                return True, gap_start
            else:
                gap_start = event.end_time
        if (FINAL_MIN - gap_start) > unsched_event.duration:

            return True, gap_start
        return False, None
    
    def _try_find_all_slots_for_event(self, unsched_event, events_list):
        """
        Find all available slots for an event in the events list.
        Args: unsched_event (UnscheduledEvent): The event to place.
            events_list (list): List of events on the day.
        Returns: list: List of tuples (start_time, gap_size).
        """
        start_times = []
        gap_start = 0
        for i in range(len(events_list)):

            event = events_list[i][1]
            gap = event.start_time - gap_start

            if gap < 0 and (event.end_time > gap_start):
                gap_start = event.end_time
                continue

            if gap > unsched_event.duration:
                start_times.append((gap_start, gap))

            gap_start = event.end_time

        gap = FINAL_MIN - gap_start
        if gap > unsched_event.duration:
            start_times.append((gap_start, gap))

        return start_times
    
    def _find_latest_slot_for_event(self, unsched_event, events_list):
        """
        Find the latest possible slot for an event.
        Args: unsched_event (UnscheduledEvent): The event to place.
            events_list (list): List of events on the day.
        Returns: int or None: The latest start time, or None if no slot found.
        """
        slots = self._try_find_all_slots_for_event(unsched_event, events_list)
        duration = unsched_event.duration
        slots = [(x + (y-duration)) for x, y in slots]
        slots.sort()
        return slots[-1] if slots else None

    def print_days(self):
        """
        Print the details of each day.
        Returns: None
        """
        for i in range(len(self.days)):
            day = self.days[i]
            print(f"Day: {i} | Events: {day.events} | ")
    
    def create_output(self):
        """
        Create the output list of scheduled unscheduled events.
        Returns: list: List of tuples (start_time, end_time, date, name, location, block_type, description).
        """
        # format for output: (start, end, date, name, location, block_type, description)
        results = []
        for index, day in enumerate(self.days):
            results.extend(self._extract_unsched_event_details(index, day))
        return results
    
    def _extract_unsched_event_details(self, index, day):
        """
        Extract details of unscheduled events for a day.
        Args: index (int): Day index.
            day (Day): The day object.
        Returns: list: List of event details tuples.
        """
        events = []
        for _, event in day.events:
            self._add_unscheduled_events_to_event_list(index, events, event)
        return events

    def _add_unscheduled_events_to_event_list(self, index, events, event):
        if not event.scheduled:
            events.append((event.start_time_dt, event.end_time_dt, self._calculate_date(index), event.name, event.location, event.block_type, event.description))

    def _calculate_date(self, index):
        """
        Calculate the date for a given day index.
        Args: index (int): Day index.
        Returns: date: The calculated date.
        """
        return self.request.week_start + datetime.timedelta(days=index)
        
    
    def solve(self):
        """
        Solve the scheduling problem by adding windows, scheduled events, and unscheduled events.
        Returns: list: The output list of scheduled events.
        """
        self.create_daily_windows(self.request.windows)
        self.add_scheduled_events()
        self.add_unscheduled_events()
        return self.create_output()
    