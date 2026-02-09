from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models

# Create your models here.


class User(models.Model):
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
        ("commute", "Commute"),
    ]

    day = models.ForeignKey(
        DayPlan, on_delete=models.CASCADE, related_name="time_blocks"
    )

    start_time = models.TimeField()
    end_time = models.TimeField()
    block_type = models.CharField(max_length=10, choices=BLOCK_TYPE_CHOICES)


# Choices for day of the week

DAYS_OF_THE_WEEK = [
    ("MON", "Monday"),
    ("TUE", "Tuesday"),
    ("WED", "Wednesday"),
    ("THU", "Thrusday"),
    ("FRI", "Friday"),
    ("SAT", "Saturday"),
    ("SUN", "Sunday"),
]


class UserPreferences(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="user_preferences"
    )
    sleep_start = models.TimeField()
    sleep_end = models.TimeField()

    study_start = models.TimeField()
    study_end = models.TimeField()

    commute_start = models.TimeField()
    commute_end = models.TimeField()

    day = models.CharField(max_length=3, choices=DAYS_OF_THE_WEEK)
