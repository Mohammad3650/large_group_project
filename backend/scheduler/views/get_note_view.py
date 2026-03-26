from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from scheduler.models.Note import Note
from scheduler.serializers.note_serializer import NoteSerializer


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_note(request):
    """
        Retrieve the note belonging to the currently authenticated user.

        Creates a new empty note if one does not already exist for the user.

        Args:
            request (Request): The incoming HTTP request from the authenticated user.

        Returns:
            Response: A 200 response containing the serialized note data.
    """
    note, _ = Note.objects.get_or_create(user=request.user)
    serializer = NoteSerializer(note)
    return Response(serializer.data)
