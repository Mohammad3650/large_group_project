from django.db import models
from .users import User


class Note(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    content = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Note for {self.user.username}"
