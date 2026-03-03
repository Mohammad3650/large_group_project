from rest_framework import serializers
from datetime import timedelta


class WindowSerializer(serializers.Serializer):
    start_min = serializers.IntegerField(min_value=0)
    end_min = serializers.IntegerField(min_value=1)
    daily = serializers.BooleanField(required = False, default=False)

    def validate(self, attrs):
        if attrs["end_min"] <= attrs["start_min"]:
            raise serializers.ValidationError("end_min must be > start_min")
        return attrs


class UnscheduledSerializer(serializers.Serializer):
    duration = serializers.IntegerField(min_value=1)
    name = serializers.CharField()
    frequency = serializers.IntegerField(default=1, min_value=1)
    daily = serializers.BooleanField()
    start_time_preference = serializers.ChoiceField(choices=["None", "Early", "Late"], default= "None")
    location = serializers.CharField()
    
    def validate(self, attrs):
        daily = attrs["daily"]
        frequency = attrs.get("frequency", None)

        if daily:
            if frequency != 1:
                raise serializers.ValidationError({ "frequency": "frequency must be set to 1 when daily=true." })
        else:
            if frequency is None:
                raise serializers.ValidationError({ "frequency": "frequency is required when daily=false." })

        return attrs


class GenerateScheduleRequestSerializer(serializers.Serializer):
    week_start = serializers.DateField()
    week_end = serializers.DateField()
    even_spread = serializers.BooleanField(required = False, default=True)
    include_scheduled = serializers.BooleanField(required = False, default=True)
    windows = WindowSerializer(many=True)
    unscheduled = UnscheduledSerializer(many=True, required=False, default=list)

    def validate(self, attrs):
        week_start = attrs["week_start"]
        week_end = attrs["week_end"]

        # Check that dates are chronological
        if week_end < week_start:
            raise serializers.ValidationError({ "week_end": "week_end must be on or after week_start." })
        
        attrs["days"] = (week_end - week_start).days + 1

        return attrs

    
    
    
