from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from scheduler.serializers.user_details_serializer import UserDetailsSerializer


class UserDetailsView(generics.RetrieveUpdateAPIView):
    """
    API view for retrieving and updating the authenticated user's profile.
    """

    serializer_class = UserDetailsSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        """
        Returns the currently authenticated user.
        """

        return self.request.user
