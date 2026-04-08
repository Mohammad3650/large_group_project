from __future__ import annotations

from datetime import date, datetime, timedelta, time
from typing import Any, Dict, List, Tuple

from scheduler.utils.to_utc import to_utc

MINUTES_PER_DAY = 24 * 60


class ScheduleResponseBuilder:
    """
    Converts solver output (start_min, end_min, duration, name)
    into the same structure expected by the SaveWeeklyPlan endpoint.
    """

    def build(self, solutions: List[Tuple[int, int, int, str, str, str, str]], scheduled, week_start: str, timezone: str = 'UTC') -> Dict[str, Any]:
        events = []
        for (start_time, end_time, event_date, name, location, block_type, description) in solutions:
            if not block_type:
                block_type = self._guess_block_type(name)

            date_str = event_date.isoformat()
            utc_start, utc_date = to_utc(start_time.isoformat(timespec="seconds"), date_str, timezone)
            utc_end, _ = to_utc(end_time.isoformat(timespec="seconds"), date_str, timezone)

            events.append(
                {
                    "date": utc_date,
                    "start_time": utc_start.isoformat(timespec="seconds"),
                    "end_time": utc_end.isoformat(timespec="seconds"),
                    "block_type": block_type,
                    "location": location or "",
                    "name": name,
                    "description": description,
                }
            )

        return {"week_start": str(week_start.isoformat()), "events": events, "scheduled": scheduled}

    def _abs_min_to_date_time(self, week_start, abs_min: int) -> tuple[str, str]:
        """
        abs_min is "absolute minutes since day 0" (0..days*1440)
        Convert into:
        date: YYYY-MM-DD
        time: HH:MM:SS
        """
        if isinstance(week_start, date):
            base = week_start
        else:
            base = datetime.strptime(week_start, "%Y-%m-%d").date()

        day_index = abs_min // MINUTES_PER_DAY
        mins_in_day = abs_min % MINUTES_PER_DAY

        hour = mins_in_day // 60
        minute = mins_in_day % 60

        date_obj = base + timedelta(days=day_index)
        return date_obj, time(hour=hour, minute=minute, second=0)

    def _guess_block_type(self, name: str) -> str:
        block_type = (name or "").lower()
        if "lecture" in block_type:
            return "lecture"
        if "lab" in block_type:
            return "lab"
        if "tutorial" in block_type:
            return "tutorial"
        if "commute" in block_type or "travel" in block_type:
            return "commute"
        if "work" in block_type:
            return "work"
        if "exercise" in block_type or "gym" in block_type:
            return "exercise"
        return "study"
