from rest_framework import serializers
from ..models import TimeBlock


class TimeBlockSerializer(serializers.ModelSerializer):
    """
    Serializer for TimeBlock model instances.

    Handles serialization of time block data, including derived date formatting,
    and validates required fields and time ordering.
    """

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
            "timezone",
            "start_time",
            "end_time",
        ]

    def validate(self, attrs):
        """
        Validates incoming TimeBlock data.

        Coordinates validation by delegating to helper methods
        for required field checks and ensuring start time is before end time.

        Args:
            attrs (dict): Incoming data to validate.

        Returns:
            dict: Validated data.

        Raises:
            serializers.ValidationError: If validation fails.
        """
        errors = {}

        errors.update(self._validate_required_fields(attrs))
        errors.update(self._validate_time_order(attrs))

        if errors:
            raise serializers.ValidationError(errors)

        return attrs

    def _validate_required_fields(self, attrs):    
        """
        Validate that all required fields are present and non-empty.

        Args:
            attrs (Dict[str, Any]): Input attributes to validate.

        Returns:
            Dict[str, List[str]]: Dictionary of field-specific validation errors.
        """
        required_fields = ["name", "location", "start_time", "end_time", "timezone"]
        errors = {}

        for field in required_fields:
            if not attrs.get(field):
                errors[field] = [
                    f"{field.replace('_', ' ').capitalize()} must be provided."
                ]

        return errors

    def _validate_time_order(self, attrs):
        """
        Validate that start_time occurs before end_time.

        Args:
            attrs (Dict[str, Any]): Input attributes to validate.

        Returns:
            Dict[str, List[str]]: Dictionary containing time-related validation errors.
        """
        errors = {}

        start_time = attrs.get("start_time")
        end_time = attrs.get("end_time")

        if start_time and end_time and start_time >= end_time:
            errors["end_time"] = ["End time must be after start time."]

        return errors
