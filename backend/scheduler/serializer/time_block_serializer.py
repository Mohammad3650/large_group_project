from rest_framework import serializers
from ..models import DayPlan, TimeBlock


class TimeBlockSerializer(serializers.Serializer):
    date = serializers.DateField()
    start_time = serializers.TimeField(required=False)
    end_time = serializers.TimeField(required=False)
    duration = serializers.IntegerField(required=False)
    time_of_day_preference = serializers.CharField(required=False)
    location = serializers.CharField(allow_blank=True, required=False)
    block_type = serializers.ChoiceField(choices=TimeBlock.BLOCK_TYPE_CHOICES)
    description = serializers.CharField(allow_blank=True, required=False)
    is_fixed = serializers.BooleanField()

    def validate(self, attrs):
        is_fixed = attrs.get("is_fixed")

        if is_fixed and (
            not attrs.get("start_time")
            or not attrs.get("end_time")
            or attrs.get("start_time") >= attrs.get("end_time")
        ):
            raise serializers.ValidationError(
                "A start and end time are required in order."
            )
        elif not is_fixed and (
            attrs.get("duration") is None or not attrs.get("time_of_day_preference")
        ):
            raise serializers.ValidationError(
                "Flexible blocks require duration and time_of_day_preference."
            )

        return attrs
