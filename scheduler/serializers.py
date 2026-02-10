from rest_framework import serializers
from .models import Event

class ScheduledEventSerializer(serializers.ModelSerializer):

    class Meta:
        model = Event
        exclude = ["user"]

class UnscheduledEventSerializer(serializers.Serializer):
    duration = serializers.IntegerField(min_value=1)
    name = serializers.CharField()

class GenerateRequestSerielizer(serializers.Serializer):
    start_date = serializers.DateTimeField()
    end_date = serializers.DateTimeField()
    scheduled = ScheduledEventSerializer(many=True, required=False)
    unscheduled = UnscheduledEventSerializer(many=True)
    # other preferences to be added later

    def validate(self, attr):
        if attr["start_date"] >= attr["end_date"]:
            raise serializers.ValidationError("Invalid time window")
        return attr
