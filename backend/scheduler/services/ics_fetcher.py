from urllib.parse import urlparse
from urllib.request import Request, urlopen

from rest_framework import serializers


ALLOWED_CALENDAR_SCHEMES = {"http", "https", "webcal"}


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
    if not source_url or not source_url.strip():
        raise serializers.ValidationError({"source_url": ["A calendar URL must be provided."]})

    cleaned_url = source_url.strip()

    if cleaned_url.startswith("webcal://"):
        cleaned_url = "https://" + cleaned_url[len("webcal://"):]

    parsed_url = urlparse(cleaned_url)

    if parsed_url.scheme not in {"http", "https"}:
        raise serializers.ValidationError(
            {"source_url": ["Only http, https, or webcal calendar URLs are supported."]}
        )

    if not parsed_url.netloc:
        raise serializers.ValidationError({"source_url": ["A valid calendar URL must be provided."]})

    return cleaned_url


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
    request = Request(
        source_url,
        headers={
            "User-Agent": "StudySync Calendar Import/1.0",
            "Accept": "text/calendar, text/plain, */*",
        },
    )

    try:
        with urlopen(request, timeout=10) as response:
            raw_content = response.read()
            charset = response.headers.get_content_charset() or "utf-8"
            return raw_content.decode(charset, errors="replace")
    except Exception:
        raise serializers.ValidationError(
            {"source_url": ["Unable to fetch the calendar feed from the provided URL."]}
        )