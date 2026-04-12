from django.db import models

from .User import User

NAME_MAX_LENGTH = 100
SOURCE_URL_MAX_LENGTH = 1000
UNIQUE_USER_SOURCE_URL_CONSTRAINT = "unique_calendar_subscription_per_user_url"


class CalendarSubscription(models.Model):
    """
    Stores an external calendar feed subscribed to by a user.
    """

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="calendar_subscriptions",
    )
    name = models.CharField(max_length=NAME_MAX_LENGTH)
    source_url = models.CharField(max_length=SOURCE_URL_MAX_LENGTH)
    is_active = models.BooleanField(default=True)
    last_synced_at = models.DateTimeField(null=True, blank=True)
    last_error = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "source_url"],
                name=UNIQUE_USER_SOURCE_URL_CONSTRAINT,
            )
        ]

    def __str__(self):
        return f"{self.user_id} - {self.name}"