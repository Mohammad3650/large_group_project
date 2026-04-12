import csv
from io import StringIO

CSV_HEADERS = [
    "date",
    "name",
    "block_type",
    "start_time",
    "end_time",
    "location",
    "description",
]


def format_optional_time(time_value):
    """
    Format an optional time value for export.

    Args:
        time_value (time | None): Time value to format.

    Returns:
        str: Formatted time string or an empty string.
    """
    return str(time_value) if time_value else ""


def build_csv_row(block):
    """
    Build a CSV row for a single time block.

    Args:
        block (TimeBlock): Time block to serialise.

    Returns:
        list: CSV row values for the time block.
    """
    return [
        block.day.date,
        block.name,
        block.block_type,
        format_optional_time(block.start_time),
        format_optional_time(block.end_time),
        block.location,
        block.description,
    ]


def write_csv_headers(writer):
    """
    Write CSV headers to a CSV writer.

    Args:
        writer (csv.writer): CSV writer instance.

    Returns:
        None
    """
    writer.writerow(CSV_HEADERS)


def write_csv_rows(writer, time_blocks):
    """
    Write exported time block rows to a CSV writer.

    Args:
        writer (csv.writer): CSV writer instance.
        time_blocks (Iterable[TimeBlock]): Time blocks to export.

    Returns:
        None
    """
    for block in time_blocks:
        writer.writerow(build_csv_row(block))


def build_csv_content(time_blocks):
    """
    Build CSV text content for exported time blocks.

    Args:
        time_blocks (Iterable[TimeBlock]): Time blocks to export.

    Returns:
        str: CSV content as text.
    """
    output = StringIO()
    writer = csv.writer(output)

    write_csv_headers(writer)
    write_csv_rows(writer, time_blocks)

    return output.getvalue()