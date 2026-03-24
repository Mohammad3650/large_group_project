from dataclasses import dataclass
from typing import Any, Dict, List, Tuple
import datetime


@dataclass(frozen=True)
class ParsedScheduleRequest:
    """
    Immutable dataclass representing a parsed schedule generation request.
    """
    week_start: datetime.date
    week_end: datetime.date
    days: int
    even_spread: bool
    include_scheduled: bool
    windows: List[Tuple[int, int, bool]]
    unscheduled: List[Tuple[int, str, int, bool, str, str, str, str]] # unscheduled: (duration, name, frequency, daily, start_time_preference, location, block_type, description)


class ScheduleRequestParser:
    """
    Service for parsing validated schedule request data into structured format.
    """

    def _time_to_abs_min(self, time):
        """
        Convert time object to absolute minutes since midnight.
        @param time: Time object or None
        @return: Minutes since midnight or None
        """
        if time is None:
            return None

        return time.hour * 60 + time.minute
    
    def create_windows(self, windows):
        """
        Process window data into list of dicts with absolute minute times.
        @param windows: List of window dicts
        @return: List of processed window dicts
        """
        new_windows = []
        for window in windows:
            start = self._time_to_abs_min(window["start_min"])
            end = self._time_to_abs_min(window["end_min"])
            daily = window["daily"]

            if start < end:
                new_windows.append({"start_min": start, "end_min": end, "daily": daily})
                
            else:
                new_windows.append({"start_min": 0, "end_min": end, "daily": daily})
                new_windows.append({"start_min": start, "end_min": 1440, "daily": daily})
        
        return new_windows


    def parse(self, validated: Dict[str, Any]) -> ParsedScheduleRequest:
        """
        Parse validated request data into ParsedScheduleRequest dataclass.
        @param validated: Validated request dict
        @return: ParsedScheduleRequest instance
        """
        week_start = validated["week_start"]   # datetime.date
        week_end = validated["week_end"]       # datetime.date
        days = validated["days"]

        even_spread = validated.get("even_spread", True)
        include_scheduled = validated.get("include_scheduled", True)

        windows = [(w["start_min"], w["end_min"], w.get("daily", False)) for w in self.create_windows(validated["windows"])]
        
        unscheduled = [
            (
                u["duration"], u["name"], u.get("frequency", 1),
                u["daily"], u.get("start_time_preference", "None"), u.get("location", ""),
                u.get("block_type", "study"), u.get("description", ""), 
                )
            for u in validated.get("unscheduled", [])
        ]

        return ParsedScheduleRequest( week_start, week_end, days, even_spread, include_scheduled, windows, unscheduled, )