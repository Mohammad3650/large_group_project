from typing import Optional

DEFAULT_BLOCK_TYPE = "lecture"
BLOCK_TYPE_KEYWORDS = (
    ("tutorial", "tutorial"),
    ("lab", "lab"),
)
DESCRIPTION_PREFIXES_TO_IGNORE = (
    "date:",
    "time:",
    "location:",
    "venue:",
    "event type:",
)
DEFAULT_IMPORTED_EVENT_NAME = "Imported Event"


def classify_block_type(summary: Optional[str]) -> str:
    """
    Classify an imported event into a StudySync block type.

    Args:
        summary (str | None): Event title/summary.

    Returns:
        str: A valid StudySync block type.
    """
    lowered_summary = (summary or "").lower()

    for keyword, block_type in BLOCK_TYPE_KEYWORDS:
        if keyword in lowered_summary:
            return block_type

    return DEFAULT_BLOCK_TYPE


def should_keep_description_line(line: str) -> bool:
    """
    Decide whether a description line should be kept.

    Args:
        line (str): A stripped description line.

    Returns:
        bool: True if the line should be kept.
    """
    if not line:
        return False

    lowered_line = line.lower()
    return not any(
        lowered_line.startswith(prefix)
        for prefix in DESCRIPTION_PREFIXES_TO_IGNORE
    )


def clean_event_description(description: Optional[str]) -> str:
    """
    Remove repeated metadata lines from imported calendar descriptions.

    Args:
        description (str | None): Raw imported description.

    Returns:
        str: Cleaned description.
    """
    if not description:
        return ""

    cleaned_lines = [
        line
        for raw_line in description.splitlines()
        if should_keep_description_line(line := raw_line.strip())
    ]
    return "\n".join(cleaned_lines)


def get_event_summary(event) -> str:
    """
    Get a cleaned event summary.

    Args:
        event (dict): Parsed event dictionary.

    Returns:
        str: Cleaned summary for display/storage.
    """
    return (event["summary"] or DEFAULT_IMPORTED_EVENT_NAME).strip()