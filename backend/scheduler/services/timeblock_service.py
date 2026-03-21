from scheduler.models import DayPlan, TimeBlock


def get_or_create_dayplan(user, date):
    """
    Get or create the DayPlan for a given user and date.

    Args:
        user (User): The authenticated user.
        date (date): The date for the day plan.

    Returns:
        DayPlan: The existing or newly created DayPlan.
    """
    dayplan, _ = DayPlan.objects.get_or_create(user=user, date=date)
    return dayplan


def create_timeblock(dayplan, data):
    """
    Create a TimeBlock for a given DayPlan using validated data.

    Args:
        dayplan (DayPlan): The parent DayPlan.
        data (dict): TimeBlock field values.

    Returns:
        TimeBlock: The created TimeBlock instance.
    """
    return TimeBlock.objects.create(
        day=dayplan,
        name=data.get("name"),
        start_time=data.get("start_time"),
        end_time=data.get("end_time"),
        location=data.get("location", ""),
        block_type=data["block_type"],
        description=data.get("description", ""),
    )


def update_timeblock(time_block, dayplan, data):
    """
    Update an existing TimeBlock using imported calendar data.

    Args:
        time_block (TimeBlock): The TimeBlock to update.
        dayplan (DayPlan): The DayPlan the block should belong to.
        data (dict): Updated field values.

    Returns:
        TimeBlock: The updated TimeBlock instance.
    """
    time_block.day = dayplan
    time_block.name = data.get("name", time_block.name)
    time_block.start_time = data.get("start_time", time_block.start_time)
    time_block.end_time = data.get("end_time", time_block.end_time)
    time_block.location = data.get("location", "")
    time_block.block_type = data.get("block_type", time_block.block_type)
    time_block.description = data.get("description", "")
    time_block.save()

    return time_block