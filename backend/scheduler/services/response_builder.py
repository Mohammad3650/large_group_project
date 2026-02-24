from __future__ import annotations

from datetime import date, datetime, timedelta
from typing import Any, Dict, List, Tuple

MINUTES_PER_DAY = 24 * 60


class ScheduleResponseBuilder:
    """
    Converts solver output (start_min, end_min, duration, name)
    into the same structure expected by the SaveWeeklyPlan endpoint.

    Output format:
    {
      "week_start": "YYYY-MM-DD",
      "events": [
        {
          "date": "YYYY-MM-DD",
          "start_time": "HH:MM:SS",
          "end_time": "HH:MM:SS",
          "block_type": "study|lecture|lab|tutorial|...",
          "location": "",
          "is_fixed": False
        }
      ]
    }
    """

    def build(
        self,
        solutions: List[Tuple[int, int, int, str]],
        week_start: str,
    ) -> Dict[str, Any]:
        events = []
        for (s, e, d, name) in solutions:
            date_s, start_time = self._abs_min_to_date_time(week_start, s)
            date_e, end_time = self._abs_min_to_date_time(week_start, e)

            # Sanity: if solver somehow crosses midnight, keep end_date separate
            # Save serializer likely expects a single "date" per event though.
            # Keep the start date; if end spills over, still send end_time.
            block_type = self._guess_block_type(name)

            events.append(
                {
                    "date": date_s,
                    "start_time": start_time,
                    "end_time": end_time,
                    "block_type": block_type,
                    "location": "",
                    "is_fixed": False,
                }
            )

        return {
            "week_start": str(week_start),
            "events": events,
        }

    def _abs_min_to_date_time(self, week_start, abs_min: int) -> tuple[str, str]:
        """
        abs_min is "absolute minutes since day 0" (0..days*1440)
        Convert into:
        date: YYYY-MM-DD
        time: HH:MM:SS
        """

        # Handle both string and date objects
        if isinstance(week_start, date):
            base = week_start
        else:
            base = datetime.strptime(week_start, "%Y-%m-%d").date()

        day_index = abs_min // MINUTES_PER_DAY
        mins_in_day = abs_min % MINUTES_PER_DAY

        hour = mins_in_day // 60
        minute = mins_in_day % 60

        date_obj = base + timedelta(days=day_index)
        return str(date_obj), f"{hour:02d}:{minute:02d}:00"

    def _guess_block_type(self, name: str) -> str:
        n = (name or "").lower()
        if "lecture" in n:
            return "lecture"
        if "lab" in n:
            return "lab"
        if "tutorial" in n:
            return "tutorial"
        if "commute" in n or "travel" in n:
            return "commute"
        if "work" in n:
            return "work"
        if "exercise" in n or "gym" in n:
            return "exercise"
        if "break" in n:
            return "break"
        return "study"