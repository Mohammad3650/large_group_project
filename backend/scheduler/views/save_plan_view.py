from datetime import timedelta
from typing import Dict, Tuple

from django.db import transaction
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from scheduler.models import DayPlan, TimeBlock
from scheduler.serializer.save_plan_serializer import SaveWeeklyPlanSerializer

from scheduler.views.create_schedule_view import get_or_create_dayplan, create_timeblock


class SaveWeeklyPlanView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        serializer = SaveWeeklyPlanSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        events = serializer.validated_data["events"]
        created = []

        for ev in events:
            date = ev["date"]
            dayplan = get_or_create_dayplan(user, date)
            created.append(create_timeblock(dayplan, ev))


        return Response(
            { "message": "Weekly plan saved", "events_saved": len(created) },
            status=status.HTTP_201_CREATED,
        )