from rest_framework import serializers
from ..models import DayPlan, TimeBlock

class TimeBlockSerializer(serializers.Serializer):
    date = serializers.DateField()
    start_time = serializers.DateTimeField()
    end_time = serializers.DateTimeField()
    location = serializers.CharField(allow_blank=True, required=False)
    block_type = serializers.ChoiceField(choices=TimeBlock.BLOCK_TYPE_CHOICES)

    def validate(self, attrs):
        if attrs["end_time"] <= attrs["start_time"]:
            raise serializers.ValidationError("End time must be after start time.")
        return attrs