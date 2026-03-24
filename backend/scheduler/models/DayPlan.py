from django.db import models
from .User import User


class DayPlan(models.Model):
    """
    Represents a user's plan for a specific day.
    Each user can only have one DayPlan per date.
    """

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField()

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "date"],
                name="unique_dayplan_per_user_date",
            )
        ]
