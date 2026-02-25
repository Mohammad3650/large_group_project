from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from ..models import Note
from ..serializer.note_serializer import NoteSerializer


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_note(request):
    note, _ = Note.objects.get_or_create(user=request.user)
    serializer = NoteSerializer(note)
    return Response(serializer.data)


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def save_note(request):
    note, _ = Note.objects.get_or_create(user=request.user)
    serializer = NoteSerializer(note, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
