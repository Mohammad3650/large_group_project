import bisect
from dataclasses import dataclass
import datetime
from datetime import time

DAY_MINS = 1440
FINAL_MIN = 1439

class Event:
    def __init__(self, scheduled, start_time = None, end_time = None, name = None):
        self.start_time = start_time
        self.end_time = end_time
        self.name = name
        self.scheduled = scheduled
    
    def __str__(self):
        return f"start: {self.start_time_dt}, end: {self.end_time_dt}, name: {self.name}, scheduled: {self.scheduled}"
    
    def __repr__(self):
        return self.__str__()
    
    def _abs_mins_to_time(self, abs):
        return f"{abs // 60}:{abs % 60}"
        # return abs
    
    # def _abs_time_to_datetime(self, abs):
    #     return time(hour=abs // 60, minute = abs % 60, second = 0)

    def _abs_time_to_datetime(self, abs_min: int) -> tuple[str, str]:
        """
        abs_min is "absolute minutes since day 0" (0..days*1440)
        Convert into:
        date: YYYY-MM-DD
        time: HH:MM:SS
        """
        mins_in_day = abs_min % DAY_MINS

        hour = mins_in_day // 60
        minute = mins_in_day % 60

        return time(hour=hour, minute=minute, second=0)
    
    @property
    def start_time_dt(self):
        return self._abs_time_to_datetime(self.start_time)
    
    @property
    def end_time_dt(self):
        return self._abs_time_to_datetime(self.end_time)
    
    def __lt__(self, other):
        return self.end_time < other.end_time



class UnscheduledEvent(Event):
    def __init__(self, scheduled, name, duration, frequency, daily, start_time_preference, location, block_type, description, start_time = None, end_time = None):
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
        self.available = DAY_MINS
        self.relative_start = relative_start
        self.unsched_ev_count = 0
        self.sched_ev_count = 0
        self.events = []
    
    def add_event(self, event):
        bisect.insort(self.events, (event.start_time, event))
        self.available -= event.start_time
        if event.scheduled:
            self.sched_ev_count += 1
        else:
            self.unsched_ev_count += 1


class Scheduler:
    def __init__(self, request, scheduled):
        self.request = request
        self.scheduled = scheduled
        self.days = self.create_days(request.days)

    # create a day object and add it to list of days. set the relative start tine of each day
    def create_days(self, days):
        created_days = []
        for count in range(days):
            created_days.append(Day(DAY_MINS * count))
        return created_days
    
    # Create a window for each day. Assume daily to be true for all windows.
    def create_daily_windows(self, windows):
        for start, end, _ in windows:
            for day in self.days:
                day.add_event(Event(True, start, end, "window"))
    
    # Add scheduled events to the respective days
    def add_scheduled_events(self):
        for start, end, name in self.scheduled:
            day_index = start // DAY_MINS
            day = self.days[day_index]
            day.add_event(Event(True, start, end, name))

    def _get_ordered_days(self):
        if self.request.even_spread:
            return sorted(
                self.days, 
                key=lambda day: (day.unsched_ev_count) + (day.sched_ev_count if self.request.include_scheduled else 0)
                )
        else:
            return self.days
        
    def _create_unsched_event_object(self, event):
        return UnscheduledEvent(False, *event)
    
    def _sort_unscheduled_events(self):
        events = self.request.unscheduled
        return sorted(
            events,
            key = lambda event: (not event[3], event[4] != "Late")
        )
    
    def add_unscheduled_events(self):
        for event in self.request.unscheduled:
            # check if event is daily event
            daily = event[3]
            preference = event[4]
            frequency = event[2]
            result = False
            
            for i in range(frequency):
                if daily:
                    result = self._handle_daily_unsched_events(event)
                elif preference == "Late":
                    result = self._handle_late_unsched_event(event)
                else:
                    result = self._handle_simple_unsched_events(event)

                if daily and result:
                    break
                elif not result: 
                    return False

                
    def _handle_simple_unsched_events(self, event):
        result = False
        event_obj = self._create_unsched_event_object(event)
        days = self._get_ordered_days()
        for day in days:
            result = self._try_add_event_to_day(event_obj, day)
            if result:
                return True
        if not result:
            print(f"ERROR: Infeasible. {event} COULD NOT BE PLACED")
            return False # Could not place unscheduled event

    def _handle_daily_unsched_events(self, event):
        days = self._get_ordered_days()
        for day in days:
            if event[3]:
                result = self._handle_late_unsched_event(event)
            else:
                event_obj = self._create_unsched_event_object(event)
                result = self._try_add_event_to_day(event_obj, day)
            if not result:
                print(f"ERROR: Infeasible. {event} COULD NOT BE PLACED")
                return False # Couldn't be placed on any day
        return True
    
    def _handle_late_unsched_event(self, event):
        # Try place the event on each day using reverse first fit
        # sort the results and select the latest
        slots = []
        unsched_event = self._create_unsched_event_object(event)
        for i in range(len(self.days)):
            start = self._find_latest_slot_for_event(unsched_event, self.days[i].events)
            if start:
                bisect.insort(slots, (start, i))
        
        if slots:
            start, dayIdx = slots[-1]
            unsched_event.start_time = start
            unsched_event.end_time = start + unsched_event.duration
            self.days[dayIdx].add_event(unsched_event)
            return True
        else:
            print(f"ERROR: Infeasible. {event} COULD NOT BE PLACED")
            return False


    # Try to add the event to the given day
    def _try_add_event_to_day(self, unsched_event, day):
        found, start = self._try_find_slot_for_event(unsched_event, day.events)
        if found:
            unsched_event.start_time = start
            unsched_event.end_time = start + unsched_event.duration
            day.add_event(unsched_event)
            return True
        else:
            return False

    # find the first available time slot in the given list of events
    def _try_find_slot_for_event(self, unsched_event, events_list):
        gap_start = 0
        for i in range(len(events_list)):

            event = events_list[i][1]
            gap = event.start_time - gap_start

            # handle overlapping events
            if gap < 0:
                # gap_start = event.end_time
                if event.end_time > gap_start:
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
        start_times = []
        gap_start = 0
        for i in range(len(events_list)):

            event = events_list[i][1]
            gap = event.start_time - gap_start

            # handle overlapping events
            if gap < 0:
                # gap_start = event.end_time
                if event.end_time > gap_start:
                    gap_start = event.end_time
                continue

            if gap > unsched_event.duration:
                # Add event to day
                start_times.append((gap_start, gap))

            gap_start = event.end_time

        gap = FINAL_MIN - gap_start
        if gap > unsched_event.duration:
            start_times.append((gap_start, gap))

        return start_times
    
    def _find_latest_slot_for_event(self, unsched_event, events_list):
        slots = self._try_find_all_slots_for_event(unsched_event, events_list)
        duration = unsched_event.duration
        slots = [(x + (y-duration)) for x, y in slots]
        slots.sort()
        return slots[-1] if slots else None

    def print_days(self):
        for i in range(len(self.days)):
            day = self.days[i]
            print(f"Day: {i} | Events: {day.events} | ")
    
    def create_output(self):
        # format for output: (start, end, date, name, location, block_type, description)
        results = []
        for index, day in enumerate(self.days):
            results.extend(self._extract_unsched_event_details(index, day))
        return results
    
    def _extract_unsched_event_details(self, index, day):
        events = []
        for _, event in day.events:
            if not event.scheduled:
                events.append((event.start_time_dt, event.end_time_dt, self._calculate_date(index), event.name, event.location, event.block_type, event.description))
        return events

    def _calculate_date(self, index):
        return self.request.week_start + datetime.timedelta(days=index)
        
    
    def solve(self):
        self.create_daily_windows(self.request.windows)
        self.add_scheduled_events()
        self.add_unscheduled_events()
        return self.create_output()
    