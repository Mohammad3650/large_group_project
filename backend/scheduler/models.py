from django.db import models
from django.conf import settings

# Create your models here.


class User(models.Model):
    auth_user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="scheduler_profile",
    )
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()


class DayPlan(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField()


class TimeBlock(models.Model):

    BLOCK_TYPE_CHOICES = [
        ("sleep", "Sleep"),
        ("study", "Study"),
        ("lecture", "Lecture"),
        ("lab", "Lab"),
        ("tutorial", "Tutorial"),
        ("commute", "Commute"),
        ("exercise", "Exercise"),
        ("break", "Break"),
        ("work", "Work"),
        ("extracurricular", "Extracurricular"),
    ]

    day = models.ForeignKey(
        DayPlan, on_delete=models.CASCADE, related_name="time_blocks"
    )

    start_time = models.TimeField()
    end_time = models.TimeField()
    block_type = models.CharField(max_length=20, choices=BLOCK_TYPE_CHOICES)


