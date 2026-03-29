from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView


class DashboardView(APIView):
    """
    Protected dashboard endpoint.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Returns a personalised welcome message for the authenticated user.

        Args:
            request (Request): The incoming HTTP request from the authenticated user.

        Returns:
            Response: A 200 response containing a welcome message with the user's username.
        """
        message = f"Welcome to your dashboard, {request.user.username}!"
        return Response({"message": message})
