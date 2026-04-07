from rest_framework import serializers


class WindowSerializer(serializers.Serializer):
    """
    Serializer for scheduling windows with validation for wake/sleep times.
    """

    start_min = serializers.TimeField(
        error_messages={
            "required": "Wake up must be provided.",
            "null": "Wake up must be provided.",
            "invalid": "Wake up must be a valid time.",
        }
    )

    end_min = serializers.TimeField(
        error_messages={
            "required": "Sleep must be provided.",
            "null": "Sleep must be provided.",
            "invalid": "Sleep must be a valid time.",
        }
    )

    daily = serializers.BooleanField(required=False, default=False)
    timezone = serializers.CharField(required=False, default='UTC')

    def validate(self, attrs):
        """
        Validate that wake and sleep times are not identical.

        Args:
            attrs (Dict[str, Any]): Input attributes to validate.

        Returns:
            Dict[str, Any]: Validated attributes.

        Raises:
            serializers.ValidationError: If wake and sleep times are the same.
        """
        errors = {}

        start = attrs.get("start_min")
        end = attrs.get("end_min")

        if start is not None and end is not None and start == end:
            errors["end_min"] = ["Sleep cannot be the same as wake up time."]

        if errors:
            raise serializers.ValidationError(errors)

        return attrs