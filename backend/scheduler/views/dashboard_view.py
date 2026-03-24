from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView


class DashboardView(APIView):
    """

    Protected dashboard endpoint.

    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        message = f"Welcome to your dashboard, {request.user.username}!"
        return Response({"message": message})
