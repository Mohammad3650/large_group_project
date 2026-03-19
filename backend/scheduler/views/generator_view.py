from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from scheduler.serializer.generator_serializers import GenerateScheduleRequestSerializer
from scheduler.services.schedule_service import ScheduleService


class GenerateScheduleView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        serializer = GenerateScheduleRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)
        service = ScheduleService()
        payload = service.generate(request.user, serializer.validated_data)

        return Response(payload, status=status.HTTP_200_OK)