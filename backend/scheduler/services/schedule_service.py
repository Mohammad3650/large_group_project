from typing import Any, Dict, List, Tuple

from scheduler.services.request_parser import ScheduleRequestParser
from scheduler.services.response_builder import ScheduleResponseBuilder
from scheduler.timetable.scheduler import Scheduler


class ScheduleService:
    def __init__(self) -> None:
        self.parser = ScheduleRequestParser()
        self.builder = ScheduleResponseBuilder()

    def generate(self, validated_data: Dict[str, Any]) -> Dict[str, Any]:
        parsed = self.parser.parse(validated_data)

        if not parsed.unscheduled:
            return self.builder.build([])

        engine = Scheduler(
            days=parsed.days,
            windows=parsed.windows,
            scheduled=parsed.scheduled,
            unscheduled=parsed.unscheduled,
        )

        engine.create_scheduled_intervals()
        engine.create_unscheduled_intervals()
        engine.overlapConstraints()

        if parsed.preference == "late":
            engine.lateBiasConstraints()
        else:
            engine.earlyBiasConstraints()

        solutions: List[Tuple[int, int, int, str]] = engine.solve()
        return self.builder.build(solutions)