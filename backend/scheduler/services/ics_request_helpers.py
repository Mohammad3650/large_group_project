from urllib.request import Request, urlopen

FETCH_FAILED_ERROR = {
    "source_url": ["Unable to fetch the calendar feed from the provided URL."]
}


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


def get_response_charset(response):
    """
    Retrieve the charset from a response, defaulting to utf-8.

    Args:
        response: HTTP response object.

    Returns:
        str: Response charset.
    """
    return response.headers.get_content_charset() or "utf-8"


def decode_response_content(response):
    """
    Decode response body content into text.

    Args:
        response: HTTP response object.

    Returns:
        str: Decoded response content.
    """
    raw_content = response.read()
    charset = get_response_charset(response)
    return raw_content.decode(charset, errors="replace")