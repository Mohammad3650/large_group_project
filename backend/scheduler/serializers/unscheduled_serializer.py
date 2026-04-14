from rest_framework import serializers


class UnscheduledSerializer(serializers.Serializer):
    """
    Serializer for unscheduled time blocks with validation for frequency and daily flags.
    """

    duration = serializers.IntegerField(
        min_value=1,
        error_messages={
            "required": "Duration must be provided.",
            "null": "Duration must be provided.",
            "invalid": "Duration must be a valid integer.",
            "min_value": "Duration must be at least 1.",
        },
    )
    name = serializers.CharField(
        allow_blank=False,
        error_messages={
            "required": "A name must be provided.",
            "blank": "A name must be provided.",
        },
    )
    frequency = serializers.IntegerField(
        default=1,
        min_value=1,
        error_messages={
            "required": "Frequency must be provided.",
            "null": "Frequency must be provided.",
            "invalid": "Frequency must be a valid integer.",
            "min_value": "Frequency must be at least 1.",
        },
    )
    daily = serializers.BooleanField(
        error_messages={
            "required": "Daily must be provided.",
            "null": "Daily must be provided.",
            "invalid": "Daily must be true or false.",
        }
    )
    start_time_preference = serializers.ChoiceField(
        choices=["None", "Early", "Late"],
        default="None",
        error_messages={
            "required": "Start time preference must be provided.",
            "invalid_choice": "Start time preference must be one of None, Early, or Late.",
        },
    )
    location = serializers.CharField(
        allow_blank=True,
        default="",
        error_messages={
            "required": "Location must be provided.",
            "blank": "Location must be provided.",
        },
    )

    block_type = serializers.ChoiceField(
        choices=["sleep", "study", "lecture", "lab", "tutorial", "commute", "exercise", "break", "work", "extracurricular"],
        default="study",
        error_messages={
            "required": "Block type must be provided.",
            "invalid_choice": "Block type must be one of sleep, study, lecture, lab, tutorial, commute, exercise, break, work, or extracurricular.",
        },
    )

    description = serializers.CharField(
        allow_blank=True,
        default="",
        error_messages={
            "required": "Description must be provided.",
            "blank": "Description must be provided.",
        },
    )

    def validate(self, attrs):
        """
        Validate frequency based on the daily flag.

        Args:
            attrs (Dict[str, Any]): Input attributes to validate.

        Returns:
            Dict[str, Any]: Validated attributes.

        Raises:
            serializers.ValidationError: If frequency constraints based on the
            daily flag are violated.
        """
        errors = {}

        frequency = attrs.get("frequency")
        daily = attrs.get("daily")

        if daily and frequency != 1:
            errors["frequency"] = ["Frequency must be 1 when daily=true."]

        if errors:
            raise serializers.ValidationError(errors)

        return attrs