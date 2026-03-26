from rest_framework import serializers
from scheduler.models.Note import Note


class NoteSerializer(serializers.ModelSerializer):
    """
        Serializer for the Note model.

        Exposes the note's text content and the timestamp of its last update.
        Used for both retrieving and saving a user's note via the API.

        Fields:
            content (str): The text content of the note.
            updated_at (datetime): The date and time the note was last updated.
    """
    class Meta:
        model = Note
        fields = ["content", "updated_at"]
