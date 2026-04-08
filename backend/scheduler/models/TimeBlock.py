from django.db import models
from .DayPlan import DayPlan


class TimeBlock(models.Model):
    """
    Represents an individual scheduled activity within a DayPlan.

    A TimeBlock can represent events such as study sessions,
    lectures, or exercise. It stores details including the activity name, type,
    location, time constraints (start and end times), the time at which the
    time block was completed (completed_at), and whether the block is pinned (pinned)
    and what time it was pinned (pinned_at).
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

    day = models.ForeignKey(
        DayPlan, on_delete=models.CASCADE, related_name="time_blocks"
    )
    name = models.CharField(max_length=100, blank=True)
    block_type = models.CharField(max_length=20, choices=BLOCK_TYPE_CHOICES)
    location = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True, default="")
    timezone = models.CharField(max_length=50, default="UTC")
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True, default=None)
    pinned = models.BooleanField(default=False)
    pinned_at = models.DateTimeField(null=True, blank=True, default=None)
