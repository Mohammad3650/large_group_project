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
            # "is_fixed",
            # "duration",
            # "time_of_day_preference",
            "start_time",
            "end_time",
            # "day",
        ]

    def validate(self, attrs):
        errors = {}

        if not attrs.get("name"):
            errors["name"] = ["A name must be provided."]
        if not attrs.get("location"):
            errors["location"] = ["Location must be provided."]
        # if not attrs.get("is_fixed") and attrs.get("duration") is None:
        #     errors["duration"] = ["Flexible blocks require duration."]
        # if not attrs.get("is_fixed") and not attrs.get("time_of_day_preference"):
        #     errors["time_of_day_preference"] = [
        #         "Flexible blocks require time of day preference."
        #     ]
        if not attrs.get("start_time"):
            errors["start_time"] = ["Fixed blocks require a start time."]
        if not attrs.get("end_time"):
            errors["end_time"] = ["Fixed blocks require an end time."]
        if (
            attrs.get("start_time") is not None
            and attrs.get("end_time") is not None
            and attrs.get("start_time") >= attrs.get("end_time")
        ):
            errors["end_time"] = ["End time must be after start time."]

        if errors:
            raise serializers.ValidationError(errors)

        return attrs
