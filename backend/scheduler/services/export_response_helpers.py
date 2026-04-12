from django.http import HttpResponse

CSV_FILENAME = "studysync_schedule.csv"
ICS_FILENAME = "studysync_schedule.ics"
CSV_CONTENT_TYPE = "text/csv"
ICS_CONTENT_TYPE = "text/calendar"


def build_file_download_response(content, content_type, filename):
    """
    Build a downloadable file response.

    Args:
        content (str): File content.
        content_type (str): HTTP content type.
        filename (str): Download filename.

    Returns:
        HttpResponse: Download response.
    """
    response = HttpResponse(content, content_type=content_type)
    response["Content-Disposition"] = f'attachment; filename="{filename}"'
    return response


def build_csv_download_response(content):
    """
    Build a CSV download response.

    Args:
        content (str): CSV file content.

    Returns:
        HttpResponse: CSV download response.
    """
    return build_file_download_response(
        content,
        CSV_CONTENT_TYPE,
        CSV_FILENAME,
    )


def build_ics_download_response(content):
    """
    Build an ICS download response.

    Args:
        content (str): ICS file content.

    Returns:
        HttpResponse: ICS download response.
    """
    return build_file_download_response(
        content,
        ICS_CONTENT_TYPE,
        ICS_FILENAME,
    )