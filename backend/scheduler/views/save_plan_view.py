from datetime import timedelta
from typing import Dict, Tuple

from django.db import transaction
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from scheduler.models import DayPlan, TimeBlock
from scheduler.serializer.save_plan_serializer import SaveWeeklyPlanSerializer


class SaveWeeklyPlanView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        serializer = SaveWeeklyPlanSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        week_start = serializer.validated_data["week_start"]
        week_end = week_start + timedelta(days=7)
        overwrite = serializer.validated_data["overwrite"]
        events = serializer.validated_data["events"]

        # Build/reuse DayPlans for the week
        dayplans_by_date: Dict = {}
        for i in range(7):
            d = week_start + timedelta(days=i)
            dp, _ = DayPlan.objects.get_or_create(user=request.user, date=d)
            dayplans_by_date[d] = dp

            if overwrite:
                # delete existing blocks for that day
                dp.time_blocks.all().delete()

        # Create TimeBlocks
        to_create = []
        for e in events:
            event_date = e["date"]

            if not (week_start <= event_date < week_end):
                return Response(
                    {"detail": f"Event date {event_date} is outside week range."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            dp = dayplans_by_date[event_date]

            to_create.append(
                TimeBlock(
                    day=dp,
                    block_type=e["block_type"],
                    location=e.get("location", ""),
                    is_fixed=e.get("is_fixed", True),
                    start_time=e["start_time"],
                    end_time=e["end_time"],
                    duration=e.get("duration"),
                    time_of_day_preference=e.get("time_of_day_preference"),
                )
            )

        TimeBlock.objects.bulk_create(to_create)

        return Response(
            {
                "message": "Weekly plan saved",
                "week_start": str(week_start),
                "events_saved": len(to_create),
            },
            status=status.HTTP_201_CREATED,
        )