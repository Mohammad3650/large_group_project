from django.db import models
from .users import User


class DayPlan(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField()

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "date"],
                name="unique_dayplan_per_user_date",
            )
        ]
