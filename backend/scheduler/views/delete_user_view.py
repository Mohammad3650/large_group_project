from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_user(request):
    
    """
    Deletes the currently authenticated user's account.

    Access:
    - only available to logged-in users

    Response:
    - confirms successful account deletion
    - returns HTTP 200 OK status
    """
    
    user = request.user
    user.delete()

    return Response({"message":"Account deleted"},status=status.HTTP_200_OK)