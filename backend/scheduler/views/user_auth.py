from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes

from scheduler.serializer.users_serializer import UserRegistrationSerializer, UserDetailsSerializer


@permission_classes([AllowAny])
class UserRegistrationView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer


class UserDetailsView(generics.RetrieveUpdateAPIView):
    serializer_class = UserDetailsSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user
