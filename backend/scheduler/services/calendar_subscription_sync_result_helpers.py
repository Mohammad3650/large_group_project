def build_sync_result():
    """
    Build an empty sync result dictionary.

    Returns:
        dict: Fresh sync counters for created, updated, and skipped events.
    """
    return {
        "created": 0,
        "updated": 0,
        "skipped": 0,
    }


def record_sync_outcome(sync_result, outcome):
    """
    Record a sync outcome in the result dictionary.

    Args:
        sync_result (dict): Sync counter dictionary.
        outcome (str): Outcome key to increment.

    Returns:
        None
    """
    sync_result[outcome] += 1