from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from scheduler.serializer.generator_serializers import GenerateScheduleRequestSerializer
from scheduler.services.schedule_service import ScheduleService


class GenerateScheduleView(APIView):
    def post(self, request):
        print(request.data)
        print()
        serializer = GenerateScheduleRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        print(serializer.validated_data)

        service = ScheduleService()
        payload = service.generate(request.user, serializer.validated_data)

        return Response(payload, status=status.HTTP_200_OK)