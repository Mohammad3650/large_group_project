from scheduler.models import DayPlan, TimeBlock
from scheduler.utils.to_utc import to_utc


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


def create_timeblock(dayplan, data, original_date):
    """
    Create a TimeBlock for a given DayPlan using validated data.

    Args:
        dayplan (DayPlan): The parent DayPlan.
        data (dict): TimeBlock field values.
        original_date (str): The original local date before UTC conversion.

    Returns:
        TimeBlock: The created TimeBlock instance.
    """
    timezone = data.get("timezone", "UTC")

    start_time_utc, start_date_utc = to_utc(
        str(data.get("start_time")),
        original_date,
        timezone,
    )
    end_time_utc, _ = to_utc(
        str(data.get("end_time")),
        original_date,
        timezone,
    )

    if str(start_date_utc) != str(original_date):
        dayplan = get_or_create_dayplan(dayplan.user, start_date_utc)

    return TimeBlock.objects.create(
        day=dayplan,
        name=data.get("name"),
        start_time=start_time_utc,
        end_time=end_time_utc,
        location=data.get("location", ""),
        block_type=data["block_type"],
        description=data.get("description", ""),
        timezone=timezone,
    )


def update_timeblock(time_block, dayplan, data, original_date):
    """
    Update an existing TimeBlock using imported calendar data.

    Args:
        time_block (TimeBlock): The TimeBlock to update.
        dayplan (DayPlan): The DayPlan the block should belong to.
        data (dict): Updated field values.
        original_date (str): The original local date before UTC conversion.

    Returns:
        TimeBlock: The updated TimeBlock instance.
    """

    timezone = data.get("timezone", "UTC")

    start_time_utc, start_date_utc = to_utc(
        str(data.get("start_time")),
        original_date,
        timezone,
    )
    end_time_utc, _ = to_utc(
        str(data.get("end_time")),
        original_date,
        timezone,
    )

    if str(start_date_utc) != str(original_date):
        dayplan = get_or_create_dayplan(dayplan.user, start_date_utc)

    time_block.day = dayplan
    time_block.name = data.get("name", time_block.name)
    time_block.start_time = start_time_utc
    time_block.end_time = end_time_utc
    time_block.location = data.get("location", "")
    time_block.block_type = data.get("block_type", time_block.block_type)
    time_block.description = data.get("description", "")
    time_block.timezone = timezone
    time_block.save()

    return time_block