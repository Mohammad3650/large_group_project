from rest_framework import serializers

from scheduler.services.ics_request_helpers import (
    FETCH_FAILED_ERROR,
    build_calendar_request,
    decode_response_content,
    open_calendar_request,
)
from scheduler.services.ics_url_helpers import normalise_source_url_value


def normalise_subscription_url(source_url):
    """
    Normalise an external calendar URL.

    Args:
        source_url (str): The raw user-provided URL.

    Returns:
        str: A normalised URL suitable for fetching.

    Raises:
        serializers.ValidationError: If the URL is invalid.
    """
    return normalise_source_url_value(source_url)


def fetch_ics_content(source_url):
    """
    Fetch ICS content from a normalised calendar URL.

    Args:
        source_url (str): The normalised URL.

    Returns:
        str: Raw ICS content.

    Raises:
        serializers.ValidationError: If the calendar could not be fetched.
    """
    request = build_calendar_request(source_url)

    try:
        with open_calendar_request(request) as response:
            return decode_response_content(response)
    except Exception:
        raise serializers.ValidationError(FETCH_FAILED_ERROR)