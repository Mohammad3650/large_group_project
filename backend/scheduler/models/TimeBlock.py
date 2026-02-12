from django.db import models
from .DayPlan import DayPlan


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
