from urllib.parse import urlparse
from urllib.request import Request, urlopen

from rest_framework import serializers

ALLOWED_FETCH_SCHEMES = {"http", "https"}

MISSING_URL_ERROR = {"source_url": ["A calendar URL must be provided."]}
INVALID_URL_ERROR = {"source_url": ["A valid calendar URL must be provided."]}
UNSUPPORTED_SCHEME_ERROR = {
    "source_url": ["Only http, https, or webcal calendar URLs are supported."]
}
FETCH_FAILED_ERROR = {
    "source_url": ["Unable to fetch the calendar feed from the provided URL."]
}


def validate_source_url_present(source_url):
    """
    Ensure a source URL value was provided.

    Args:
        source_url (str): Raw user-provided URL.

    Returns:
        None
    """
    if not source_url or not source_url.strip():
        raise serializers.ValidationError(MISSING_URL_ERROR)


def strip_source_url(source_url):
    """
    Strip whitespace from a source URL.

    Args:
        source_url (str): Raw user-provided URL.

    Returns:
        str: Stripped URL.
    """
    return source_url.strip()


def replace_webcal_scheme(source_url):
    """
    Convert a webcal URL into an https URL.

    Args:
        source_url (str): Stripped source URL.

    Returns:
        str: URL with webcal converted to https when needed.
    """
    if source_url.startswith("webcal://"):
        return "https://" + source_url[len("webcal://"):]
    return source_url


def parse_source_url(source_url):
    """
    Parse a source URL.

    Args:
        source_url (str): Cleaned source URL.

    Returns:
        ParseResult: Parsed URL.
    """
    return urlparse(source_url)


def validate_supported_scheme(parsed_url):
    """
    Ensure the parsed URL uses a supported fetch scheme.

    Args:
        parsed_url (ParseResult): Parsed URL.

    Returns:
        None
    """
    if parsed_url.scheme not in ALLOWED_FETCH_SCHEMES:
        raise serializers.ValidationError(UNSUPPORTED_SCHEME_ERROR)


def validate_url_has_host(parsed_url):
    """
    Ensure the parsed URL includes a host.

    Args:
        parsed_url (ParseResult): Parsed URL.

    Returns:
        None
    """
    if not parsed_url.netloc:
        raise serializers.ValidationError(INVALID_URL_ERROR)


def normalise_source_url_value(source_url):
    """
    Normalise and validate a calendar subscription URL.

    Args:
        source_url (str): Raw user-provided URL.

    Returns:
        str: Normalised URL suitable for fetching.
    """
    validate_source_url_present(source_url)

    cleaned_url = strip_source_url(source_url)
    cleaned_url = replace_webcal_scheme(cleaned_url)
    parsed_url = parse_source_url(cleaned_url)

    validate_supported_scheme(parsed_url)
    validate_url_has_host(parsed_url)

    return cleaned_url


def build_calendar_request(source_url):
    """
    Build a request for fetching external calendar content.

    Args:
        source_url (str): Normalised calendar URL.

    Returns:
        Request: Configured request object.
    """
    return Request(
        source_url,
        headers={
            "User-Agent": "StudySync Calendar Import/1.0",
            "Accept": "text/calendar, text/plain, */*",
        },
    )


def open_calendar_request(request):
    """
    Open an external calendar request.

    Args:
        request (Request): Configured request object.

    Returns:
        HTTPResponse: Response object from urlopen.
    """
    return urlopen(request, timeout=10)


def decode_response_content(response):
    """
    Decode response body content into text.

    Args:
        response: HTTP response object.

    Returns:
        str: Decoded response content.
    """
    raw_content = response.read()
    charset = response.headers.get_content_charset() or "utf-8"
    return raw_content.decode(charset, errors="replace")