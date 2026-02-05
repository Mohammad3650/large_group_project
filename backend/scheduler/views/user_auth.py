from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated

from scheduler.serializer.users_serializer import UserRegistrationSerializer, UserDetailsSerializer

class UserRegistrationView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]


class UserDetailsView(generics.RetrieveUpdateAPIView):
    serializer_class = UserDetailsSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user
