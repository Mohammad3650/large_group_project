from django.db import models
from .DayPlan import DayPlan


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

    TIME_OF_DAY_PREFERENCES = [
        ("morning", "Morning"),
        ("afternoon", "Afternoon"),
        ("evening", "Evening"),
    ]

    FREQUENCY_CHOICES = [
        ("none", "One-time"),
        ("weekly", "Weekly"),
        ("biweekly", "Every other week"),
        ("monthly", "Monthly"),
    ]

    day = models.ForeignKey(
        DayPlan, on_delete=models.CASCADE, related_name="time_blocks"
    )
    block_type = models.CharField(max_length=20, choices=BLOCK_TYPE_CHOICES)
    location = models.CharField(max_length=255, blank=True)
    is_fixed = models.BooleanField(default=False)

    # For fixed blocks/events
    start_time = models.TimeField()
    end_time = models.TimeField()

    # For flexible blocks/events
    duration = models.IntegerField(null=True, blank=True)
    time_of_day_preference = models.CharField(
        max_length=20, choices=TIME_OF_DAY_PREFERENCES, null=True, blank=True
    )

    description = models.TextField(blank=True, null=True)

    frequency = models.CharField(
        max_length=10, choices=FREQUENCY_CHOICES, default="none"
    )

    # add location field, remove day field , remove start and end time and keep it as just how many hours you want to spend, type :daily, weekly, monthly
    # create more models to inherit time block: academic (add modolue, module code)
