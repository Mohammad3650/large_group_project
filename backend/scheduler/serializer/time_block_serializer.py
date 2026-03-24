from rest_framework import serializers
from ..models import TimeBlock


class TimeBlockSerializer(serializers.ModelSerializer):
    date = serializers.SerializerMethodField()

    def get_date(self, obj):
        """
        Returns the date of the associated DayPlan as a string.

        Args:
            obj (TimeBlock): The TimeBlock instance being serialized.

        Returns:
            str: The date of the TimeBlock's DayPlan.
        """
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
            "timezone",
            "start_time",
            "end_time",
        ]

    def validate(self, attrs):
        """
        Validates the TimeBlock data before saving.

        Ensures required fields are provided and that the start time
        occurs before the end time.

        Args:
            attrs (dict): The incoming data to validate.

        Returns:
            dict: The validated data if all checks pass.

        Raises:
            serializers.ValidationError: If any validation rule is violated.
        """
        errors = {}

        if not attrs.get("name"):
            errors["name"] = ["A name must be provided."]
        if not attrs.get("location"):
            errors["location"] = ["Location must be provided."]
        if not attrs.get("start_time"):
            errors["start_time"] = ["Start time must be provided."]
        if not attrs.get("end_time"):
            errors["end_time"] = ["End time must be provided."]
        if not attrs.get("timezone"):
            errors["timezone"] = ["Timezone must be provided."]
        if (
            attrs.get("start_time") is not None
            and attrs.get("end_time") is not None
            and attrs.get("start_time") >= attrs.get("end_time")
        ):
            errors["end_time"] = ["End time must be after start time."]

        if errors:
            raise serializers.ValidationError(errors)

        return attrs
