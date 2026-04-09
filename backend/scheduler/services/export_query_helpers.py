from scheduler.models import TimeBlock


def get_user_time_blocks_for_export(user):
    """
    Retrieve exportable time blocks for a user.

    Args:
        user (User): Authenticated user.

    Returns:
        QuerySet[TimeBlock]: Ordered time blocks for export.
    """
    return (
        TimeBlock.objects.filter(day__user=user)
        .select_related("day")
        .order_by("day__date", "start_time")
    )