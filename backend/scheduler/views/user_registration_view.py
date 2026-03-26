from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from scheduler.serializers.user_registration_serializer import UserRegistrationSerializer
from scheduler.serializers.user_details_serializer import UserDetailsSerializer


class UserRegistrationView(generics.CreateAPIView):
    """
    API view for registering a new user.

    Flow:
    - validates incoming registration data
    - creates the user
    - generates refresh and access tokens
    - returns tokens and user details in the response
    """

    permission_classes = [AllowAny]
    serializer_class = UserRegistrationSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.save()
        refresh = RefreshToken.for_user(user)

        response_data = {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": UserDetailsSerializer(user).data,
        }
        return Response(response_data, status=status.HTTP_201_CREATED)
