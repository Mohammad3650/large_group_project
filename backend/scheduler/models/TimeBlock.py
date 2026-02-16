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

    day = models.ForeignKey(
        DayPlan, on_delete=models.CASCADE, related_name="time_blocks"
    )

    start_time = models.TimeField()
    end_time = models.TimeField()
    location = models.CharField(max_length=255, blank=True)
    block_type = models.CharField(max_length=20, choices=BLOCK_TYPE_CHOICES)

    #add location field, remove day field , remove start and end time and keep it as just how many hours you want to spend, type :daily, weekly, monthly
    #create more models to inherit time block: academic (add modolue, module code)


