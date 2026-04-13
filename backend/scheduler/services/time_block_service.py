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
    day_plan, _ = DayPlan.objects.get_or_create(user=user, date=date)
    return day_plan

def prepare_time_block_data(day_plan, data, original_date):
    """
    Prepare shared TimeBlock values and resolve the correct DayPlan.

    Args:
        day_plan (DayPlan): The original parent DayPlan.
        data (dict): TimeBlock field values.
        original_date (str): The original local date before UTC conversion.

    Returns:
        tuple: (resolved_day_plan, prepared_fields)
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
        day_plan = get_or_create_dayplan(day_plan.user, start_date_utc)

    prepared_fields = {
        "name": data.get("name"),
        "start_time": start_time_utc,
        "end_time": end_time_utc,
        "location": data.get("location", ""),
        "block_type": data.get("block_type"),
        "description": data.get("description", ""),
        "timezone": timezone,
    }

    return day_plan, prepared_fields


def create_time_block(day_plan, data, original_date):
    """
    Create a TimeBlock for a given DayPlan using validated data.

    Args:
        dayplan (DayPlan): The parent DayPlan.
        data (dict): TimeBlock field values.
        original_date (str): The original local date before UTC conversion.

    Returns:
        TimeBlock: The created TimeBlock instance.
    """
    day_plan, prepared_fields = prepare_time_block_data(
        day_plan, data, original_date
    )

    return TimeBlock.objects.create(
        day=day_plan,
        **prepared_fields,
    )


def update_time_block(time_block, day_plan, data, original_date):
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

    day_plan, prepared_fields = prepare_time_block_data(
        day_plan, data, original_date
    )

    time_block.day = day_plan
    time_block.name = prepared_fields["name"] or time_block.name
    time_block.start_time = prepared_fields["start_time"]
    time_block.end_time = prepared_fields["end_time"]
    time_block.location = prepared_fields["location"]
    time_block.block_type = (
        prepared_fields["block_type"] or time_block.block_type
    )
    time_block.description = prepared_fields["description"]
    time_block.timezone = prepared_fields["timezone"]
    time_block.save()

    return time_block
