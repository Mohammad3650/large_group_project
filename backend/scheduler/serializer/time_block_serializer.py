from rest_framework import serializers
from ..models import DayPlan, TimeBlock

class TimeBlockSerializer(serializers.Serializer):
    date = serializers.DateField(input_formats=["%Y-%m-%d", "%d/%m/%Y"])
    start_time = serializers.TimeField()
    end_time = serializers.TimeField()
    location = serializers.CharField(allow_blank=True, required=False, default="")
    description = serializers.CharField(allow_blank=True, required=False, default="")
    block_type = serializers.ChoiceField(choices=TimeBlock.BLOCK_TYPE_CHOICES)

    def validate(self, attrs):
        if attrs["end_time"] <= attrs["start_time"]:
            raise serializers.ValidationError("End time must be after start time.")
        return attrs