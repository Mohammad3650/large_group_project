from django.db import models

from .User import User


class CalendarSubscription(models.Model):
    """
    Stores an external calendar feed subscribed to by a user.
    """

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="calendar_subscriptions",
    )
    name = models.CharField(max_length=100)
    source_url = models.CharField(max_length=1000)
    is_active = models.BooleanField(default=True)
    last_synced_at = models.DateTimeField(null=True, blank=True)
    last_error = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "source_url"],
                name="unique_calendar_subscription_per_user_url",
            )
        ]

    def __str__(self):
        return f"{self.user_id} - {self.name}"