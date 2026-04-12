from rest_framework import serializers

from scheduler.services.ics_fetcher import normalise_subscription_url


def validate_subscription_name(value):
    """
    Validate and clean a subscription name.

    Args:
        value (str): Raw subscription name.

    Returns:
        str: Cleaned subscription name.

    Raises:
        serializers.ValidationError: If the name is empty after stripping.
    """
    cleaned_name = value.strip()

    if not cleaned_name:
        raise serializers.ValidationError("A subscription name must be provided.")

    return cleaned_name


def validate_subscription_source_url(value):
    """
    Validate and normalise a subscription source URL.

    Args:
        value (str): Raw subscription URL.

    Returns:
        str: Normalised subscription URL.
    """
    return normalise_subscription_url(value)