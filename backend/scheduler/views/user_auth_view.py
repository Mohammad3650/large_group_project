from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from scheduler.serializer.users_serializer import (
    UserDetailsSerializer,
    UserRegistrationSerializer,
)


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


class DashboardView(APIView):
    
    """
    
    Protected dashboard endpoint.

    """
    
    permission_classes = [IsAuthenticated]

    def get(self, request):
        message = f"Welcome to your dashboard, {request.user.username}!"
        return Response({"message": message})