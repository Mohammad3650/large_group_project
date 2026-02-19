from typing import Any, Dict, List, Tuple


class ScheduleResponseBuilder:
    def build(self, solutions: List[Tuple[int, int, int, str]]) -> Dict[str, Any]:
        events = [
            {"name": name, "start_min": s, "end_min": e, "duration_mins": d}
            for (s, e, d, name) in solutions
        ]
        return {"count": len(events), "events": events}