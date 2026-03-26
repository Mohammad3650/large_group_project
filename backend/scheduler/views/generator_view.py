from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from scheduler.serializers.generator_serializers import GenerateScheduleRequestSerializer
from scheduler.services.schedule_service import ScheduleService


class GenerateScheduleView(APIView):
    """
    API endpoint for generating optimized schedules based on unscheduled events.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Validate schedule request and generate optimized schedule.
        @param request: HTTP request with schedule generation parameters
        @return: Response with generated schedule events or validation errors
        """
        serializer = GenerateScheduleRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)
        service = ScheduleService()
        payload = service.generate(request.user, serializer.validated_data)

        return Response(payload, status=status.HTTP_200_OK)