from datetime import datetime
from typing import Any, Dict

from rest_framework import serializers
from scheduler.models import DayPlan, TimeBlock


class SaveTimeBlockSerializer(serializers.Serializer):
    # Accept either (date + times) or (start_datetime/end_datetime)
    date = serializers.DateField(
        required=False,
        input_formats=["%Y-%m-%d", "%d/%m/%Y"]
    )
    name = serializers.CharField()
    start_time = serializers.TimeField(required=False)
    end_time = serializers.TimeField(required=False)

    block_type = serializers.ChoiceField(choices=[c[0] for c in TimeBlock.BLOCK_TYPE_CHOICES])
    location = serializers.CharField(required=False, allow_blank=True, default="")
    description = serializers.CharField(required=False, allow_blank=True, default="")


    def validate(self, attrs: Dict[str, Any]) -> Dict[str, Any]:
        has_date_times = all(k in attrs for k in ("date", "start_time", "end_time"))

        if not has_date_times:
            raise serializers.ValidationError(
                "Each event must include date, start_time, and end_time."
            )

        if attrs["end_time"] <= attrs["start_time"]:
            raise serializers.ValidationError("end_time must be after start_time")

        return attrs


class SaveWeeklyPlanSerializer(serializers.Serializer):
    # Monday of the week
    week_start = serializers.DateField(input_formats=["%Y-%m-%d", "%d/%m/%Y"])
    events = SaveTimeBlockSerializer(many=True, allow_empty=False)