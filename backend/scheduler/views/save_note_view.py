from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from scheduler.models.Note import Note
from scheduler.serializers.note_serializer import NoteSerializer


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def save_note(request):
    """
        Update the note belonging to the currently authenticated user.

        Creates a new empty note if one does not already exist for the user.
        Accepts partial data, so only the fields provided in the request body are updated.

        Args:
            request (Request): The incoming HTTP request containing the updated note data.

        Returns:
            Response: A 200 response containing the updated serialized note data if valid,
                      or a 400 response with validation errors if the data is invalid.
    """
    note, _ = Note.objects.get_or_create(user=request.user)
    serializer = NoteSerializer(note, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
