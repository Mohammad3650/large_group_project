from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from scheduler.api.serializers import GenerateScheduleRequestSerializer
from scheduler.services.schedule_service import ScheduleService


class GenerateScheduleView(APIView):
    def post(self, request):
        serializer = GenerateScheduleRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        service = ScheduleService()
        payload = service.generate(serializer.validated_data)

        return Response(payload, status=status.HTTP_200_OK)