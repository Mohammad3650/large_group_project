from django.db import models
from .DayPlan import DayPlan


class TimeBlock(models.Model):
    """
    Represents an individual scheduled activity within a DayPlan.

    A TimeBlock can represent events such as study sessions,
    lectures, or exercise. It stores details including the activity name, type,
    location, and time constraints (start and end times).
    """

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
    name = models.CharField(max_length=20, blank=True)
    block_type = models.CharField(max_length=20, choices=BLOCK_TYPE_CHOICES)
    location = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True, default="")
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
