from typing import Any, Dict, List, Tuple

from scheduler.services.request_parser import ScheduleRequestParser
from scheduler.services.response_builder import ScheduleResponseBuilder
from scheduler.generator.schedule_generator import Scheduler

from scheduler.models import TimeBlock
from datetime import datetime, timedelta


class ScheduleService:
    def __init__(self) -> None:
        self.parser = ScheduleRequestParser()
        self.builder = ScheduleResponseBuilder()

    def fetch_scheduled_events(self, week_start, week_end, user):
        
        DAY_MINS = 1440

        time_blocks = (
            TimeBlock.objects
            .filter(
                day__user=user,
                day__date__range=(week_start, week_end),
            )
            .select_related("day")
        )

        events = []

        for tb in time_blocks:

            day_offset = (tb.day.date - week_start).days
            start_minutes = tb.start_time.hour * 60 + tb.start_time.minute
            end_minutes = tb.end_time.hour * 60 + tb.end_time.minute

            start_min = day_offset * DAY_MINS + start_minutes
            end_min = day_offset * DAY_MINS + end_minutes

            events.append((start_min, end_min, tb.name))
        
        return events

    def generate(self, user, validated_data: Dict[str, Any]) -> Dict[str, Any]:
        parsed = self.parser.parse(validated_data)

        if not parsed.unscheduled:
             week_start = validated_data["week_start"]
             return self.builder.build([], week_start=week_start)
        
        scheduled = self.fetch_scheduled_events(parsed.week_start, parsed.week_end, user)

        engine = Scheduler( request=parsed, scheduled=scheduled )

        engine.create_scheduled_intervals()
        engine.create_unscheduled_intervals()
        engine.overlapConstraints()
        engine.applyConstraints()

        solutions: List[Tuple[int, int, int, str]] = engine.solve()
        week_start = parsed.week_start
        return self.builder.build(solutions, week_start=week_start)