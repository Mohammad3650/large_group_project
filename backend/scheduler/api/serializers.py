from rest_framework import serializers


class WindowSerializer(serializers.Serializer):
    start_min = serializers.IntegerField(min_value=0)
    end_min = serializers.IntegerField(min_value=1)

    def validate(self, attrs):
        if attrs["end_min"] <= attrs["start_min"]:
            raise serializers.ValidationError("end_min must be > start_min")
        return attrs


class FixedEventSerializer(serializers.Serializer):
    start_min = serializers.IntegerField(min_value=0)
    end_min = serializers.IntegerField(min_value=1)
    name = serializers.CharField()

    def validate(self, attrs):
        if attrs["end_min"] <= attrs["start_min"]:
            raise serializers.ValidationError("end_min must be > start_min")
        return attrs


class UnscheduledSerializer(serializers.Serializer):
    duration_mins = serializers.IntegerField(min_value=1)
    name = serializers.CharField()


class GenerateScheduleRequestSerializer(serializers.Serializer):
    days = serializers.IntegerField(min_value=1, max_value=14)
    windows = WindowSerializer(many=True)
    scheduled = FixedEventSerializer(many=True, required=False, default=list)
    unscheduled = UnscheduledSerializer(many=True, required=False, default=list)

    preference = serializers.ChoiceField(choices=["early", "late"], default="early")
