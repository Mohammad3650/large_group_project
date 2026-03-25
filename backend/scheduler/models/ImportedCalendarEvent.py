from django.db import models

from .CalendarSubscription import CalendarSubscription
from .TimeBlock import TimeBlock


class ImportedCalendarEvent(models.Model):
    """
    Stores the mapping between an imported external calendar event
    and the TimeBlock created inside StudySync.
    """

    subscription = models.ForeignKey(
        CalendarSubscription,
        on_delete=models.CASCADE,
        related_name="imported_events",
    )
    external_event_uid = models.CharField(max_length=255)
    time_block = models.ForeignKey(
        TimeBlock,
        on_delete=models.CASCADE,
        related_name="imported_calendar_events",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["subscription", "external_event_uid"],
                name="unique_imported_event_per_subscription_uid",
            )
        ]

    def __str__(self):
        return f"{self.subscription_id} - {self.external_event_uid}"