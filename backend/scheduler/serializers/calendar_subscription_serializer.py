from rest_framework import serializers

from scheduler.models import CalendarSubscription
from scheduler.serializers.calendar_subscription_serializer_helpers import (
    validate_subscription_name,
    validate_subscription_source_url,
)


class CalendarSubscriptionSerializer(serializers.ModelSerializer):
    """
    Serializer for creating and listing calendar subscriptions.
    """

    class Meta:
        model = CalendarSubscription
        fields = [
            "id",
            "name",
            "source_url",
            "is_active",
            "last_synced_at",
            "last_error",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "is_active",
            "last_synced_at",
            "last_error",
            "created_at",
            "updated_at",
        ]

    def validate_name(self, value):
        """
        Validate the subscription name.

        Args:
            value (str): Raw subscription name.

        Returns:
            str: Cleaned subscription name.
        """
        return validate_subscription_name(value)

    def validate_source_url(self, value):
        """
        Validate and normalise the source URL.

        Args:
            value (str): Raw subscription URL.

        Returns:
            str: Normalised subscription URL.
        """
        return validate_subscription_source_url(value)