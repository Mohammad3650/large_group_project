from rest_framework import serializers
from ..models import DayPlan, TimeBlock


class TimeBlockSerializer(serializers.Serializer):
    date = serializers.DateField(input_formats=["%Y-%m-%d", "%d/%m/%Y"], required=False)
    
    # fixed blocks
    start_time = serializers.TimeField(required=False)
    end_time = serializers.TimeField(required=False)

    # flexible blocks
    duration = serializers.IntegerField(required=False)
    time_of_day_preference = serializers.CharField(required=False)

    location = serializers.CharField(allow_blank=True, required=False, default="")
    description = serializers.CharField(allow_blank=True, required=False, default="")
    block_type = serializers.ChoiceField(choices=TimeBlock.BLOCK_TYPE_CHOICES)
    is_fixed = serializers.BooleanField(required=False, default=True)

    def validate(self, attrs):
        is_fixed = attrs.get("is_fixed", True)

        if is_fixed:
            if not attrs.get("date") or not attrs.get("start_time") or not attrs.get("end_time"):
                raise serializers.ValidationError("date, start_time, end_time required for fixed blocks.")
            if attrs["end_time"] <= attrs["start_time"]:
                raise serializers.ValidationError("End time must be after start time.")

        else:
            if attrs.get("duration") is None or not attrs.get("time_of_day_preference"):
                raise serializers.ValidationError("duration and time_of_day_preference required for flexible blocks.")

        return attrs
