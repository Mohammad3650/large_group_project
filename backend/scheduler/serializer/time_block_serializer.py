from rest_framework import serializers
from ..models import DayPlan, TimeBlock


class TimeBlockSerializer(serializers.ModelSerializer):
    date = serializers.SerializerMethodField()

    def get_date(self, obj):
        return str(obj.day.date)

    class Meta:
        model = TimeBlock
        fields = [
            "id",
            "name",
            "date",
            "location",
            "block_type",
            "description",
            "start_time",
            "end_time",
        ]

    def validate(self, attrs):
        errors = {}

        if not attrs.get("name"):
            errors["name"] = ["A name must be provided."]
        if not attrs.get("location"):
            errors["location"] = ["Location must be provided."]
        if not attrs.get("start_time"):
            errors["start_time"] = ["Start time must be provided."]
        if not attrs.get("end_time"):
            errors["end_time"] = ["End time must be provided."]
        if (
            attrs.get("start_time") is not None
            and attrs.get("end_time") is not None
            and attrs.get("start_time") >= attrs.get("end_time")
        ):
            errors["end_time"] = ["End time must be after start time."]

        if errors:
            raise serializers.ValidationError(errors)

        return attrs
