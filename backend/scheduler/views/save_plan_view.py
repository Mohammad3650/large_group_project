from django.db import transaction
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from scheduler.serializers.save_weekly_plan_serializer import SaveWeeklyPlanSerializer
from scheduler.services.time_block_service import (
    create_time_block,
    get_or_create_day_plan,
)


class SaveWeeklyPlanView(APIView):
    """
    API endpoint for saving a weekly plan with multiple time block events.
    """

    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        """
        Save a generated weekly plan for the authenticated user.

        Returns:
            Response: Success message and number of saved events.
        """
        serializer = SaveWeeklyPlanSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        events = serializer.validated_data["events"]
        created = []

        for event in events:
            date = event["date"]
            day_plan = get_or_create_day_plan(user, date)
            created.append(create_time_block(day_plan, event, str(date)))

        return Response(
            {"message": "Weekly plan saved", "events_saved": len(created)},
            status=status.HTTP_201_CREATED,
        )
