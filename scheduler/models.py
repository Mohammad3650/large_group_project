from django.db import models

# Create your models here.

class Event(models.Model):
    user = models.ForeignKey("auth.User", on_delete=models.CASCADE) #TODO: Check if correct user model used
    name = models.CharField(max_length=200)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    recurring = models.BooleanField(default=False) 

