from django.db import models
from .User import User


class Note(models.Model):
    """
       Represents a note belonging to a single user.

       Each user has at most one note, stored as a text field.
       The note is automatically timestamped whenever it is updated.

       Attributes:
           user (User): The user who owns this note. Deleting the user will also delete the note.
           content (str): The text content of the note. May be left blank.
           updated_at (datetime): The date and time the note was last updated, set automatically.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    content = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)
