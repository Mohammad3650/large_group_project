from datetime import datetime
from typing import Any, Dict

from rest_framework import serializers
from scheduler.models import DayPlan, TimeBlock


class SaveTimeBlockSerializer(serializers.Serializer):
    # Accept either (date + times) or (start_datetime/end_datetime)
    date = serializers.DateField(required=False)
    start_time = serializers.TimeField(required=False)
    end_time = serializers.TimeField(required=False)

    start_datetime = serializers.DateTimeField(required=False)
    end_datetime = serializers.DateTimeField(required=False)

    block_type = serializers.ChoiceField(choices=[c[0] for c in TimeBlock.BLOCK_TYPE_CHOICES])
    location = serializers.CharField(required=False, allow_blank=True, default="")
    is_fixed = serializers.BooleanField(required=False, default=True)

    duration = serializers.IntegerField(required=False, allow_null=True)
    time_of_day_preference = serializers.ChoiceField(
        required=False,
        allow_null=True,
        choices=[c[0] for c in TimeBlock.TIME_OF_DAY_PREFERENCES],
    )

    def validate(self, attrs: Dict[str, Any]) -> Dict[str, Any]:
        has_date_times = all(k in attrs for k in ("date", "start_time", "end_time"))
        has_datetimes = all(k in attrs for k in ("start_datetime", "end_datetime"))

        if not (has_date_times or has_datetimes):
            raise serializers.ValidationError(
                "Provide either (date, start_time, end_time) OR (start_datetime, end_datetime)."
            )

        if has_datetimes:
            if attrs["end_datetime"] <= attrs["start_datetime"]:
                raise serializers.ValidationError("end_datetime must be after start_datetime")

            # Convert to date + time for DB fields
            attrs["date"] = attrs["start_datetime"].date()
            attrs["start_time"] = attrs["start_datetime"].time()
            attrs["end_time"] = attrs["end_datetime"].time()

        if attrs["end_time"] <= attrs["start_time"]:
            raise serializers.ValidationError("end_time must be after start_time")

        return attrs


class SaveWeeklyPlanSerializer(serializers.Serializer):
    # Monday of the week
    week_start = serializers.DateField()
    events = SaveTimeBlockSerializer(many=True)
    overwrite = serializers.BooleanField(required=False, default=True)

    def validate_week_start(self, value):
        # enforce Monday
        if value.weekday() != 0:
            raise serializers.ValidationError("week_start must be a Monday date.")
        return value