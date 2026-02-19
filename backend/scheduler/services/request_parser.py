from dataclasses import dataclass
from typing import Any, Dict, List, Tuple


@dataclass(frozen=True)
class ParsedScheduleRequest:
    days: int
    windows: List[Tuple[int, int]]
    scheduled: List[Tuple[int, int, str]]
    unscheduled: List[Tuple[int, str]]
    preference: str


class ScheduleRequestParser:
    def parse(self, validated: Dict[str, Any]) -> ParsedScheduleRequest:
        days = validated["days"]
        windows = [(w["start_min"], w["end_min"]) for w in validated["windows"]]
        scheduled = [(e["start_min"], e["end_min"], e["name"]) for e in validated.get("scheduled", [])]
        unscheduled = [(u["duration_mins"], u["name"]) for u in validated.get("unscheduled", [])]
        preference = validated.get("preference", "early")

        return ParsedScheduleRequest(days, windows, scheduled, unscheduled, preference)