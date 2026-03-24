from typing import Any, Dict, List, Tuple

from scheduler.services.request_parser import ScheduleRequestParser
from scheduler.services.response_builder import ScheduleResponseBuilder
from scheduler.services.schedule_generator import Scheduler

from scheduler.models import TimeBlock

from django.db.models import F


class ScheduleService:
    """
    Service for generating schedules using constraint-based optimization.
    Orchestrates parsing, scheduling, and response building.
    """

    def __init__(self) -> None:
        self.parser = ScheduleRequestParser()
        self.builder = ScheduleResponseBuilder()

    def fetch_scheduled_time_blocks(self, week_start, week_end, user):
        """
        Fetch all scheduled time blocks for a user in a date range.
        @param week_start: Start date
        @param week_end: End date
        @param user: User instance
        @return: QuerySet of TimeBlock objects
        """
        time_blocks = (
            TimeBlock.objects
            .filter(
                day__user=user,
                day__date__range=(week_start, week_end),
            )
            .select_related("day")
            .annotate(date=F("day__date"))
        )

        return time_blocks

    def extract_scheduled_mins(self, time_blocks, week_start):
        """
        Convert time blocks to absolute minutes since week start.
        @param time_blocks: TimeBlock QuerySet
        @param week_start: Week start date reference
        @return: List of tuples (start_min, end_min, name)
        """
        DAY_MINS = 1440

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
        """
        Generate optimized schedule with unscheduled events placed into time windows.
        @param user: User instance
        @param validated_data: Validated request data dict
        @return: Response dict with generated schedule events
        """
        parsed = self.parser.parse(validated_data)

        if not parsed.unscheduled:
             week_start = validated_data["week_start"]
             return self.builder.build([], scheduled=[], week_start=week_start)
        
        time_blocks = self.fetch_scheduled_time_blocks(parsed.week_start, parsed.week_end, user)
        scheduled = self.extract_scheduled_mins(time_blocks, parsed.week_start)

        engine = Scheduler( request=parsed, scheduled=scheduled )

        engine.create_scheduled_intervals()
        engine.create_unscheduled_intervals()
        engine.overlap_constraints()
        engine.apply_constraints()

        solutions: List[Tuple[int, int, int, str, str, str, str]] = engine.solve()
        week_start = parsed.week_start
        return self.builder.build(solutions, list(time_blocks.values()), week_start=week_start)