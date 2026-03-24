from rest_framework import serializers

from scheduler.serializer.UnscheduledSerializer import UnscheduledSerializer
from scheduler.serializer.WindowSerializer import WindowSerializer


class GenerateScheduleRequestSerializer(serializers.Serializer):
    """
    Serializer for schedule generation requests with validation for dates and windows.
    """

    week_start = serializers.DateField(
        error_messages={
            "required": "Start date must be provided.",
            "null": "Start date must be provided.",
            "invalid": "Start date must be a valid date.",
        }
    )
    week_end = serializers.DateField(
        error_messages={
            "required": "End date must be provided.",
            "null": "End date must be provided.",
            "invalid": "End date must be a valid date.",
        }
    )
    even_spread = serializers.BooleanField(required=False, default=True)
    include_scheduled = serializers.BooleanField(required=False, default=True)
    windows = WindowSerializer(
        many=True,
        error_messages={
            "required": "At least one scheduling window must be provided.",
            "null": "At least one scheduling window must be provided.",
        },
    )
    unscheduled = UnscheduledSerializer(many=True, required=False, default=list)

    def validate(self, attrs):
        """
        Validate week dates and windows, add days count to attrs.
        @param attrs: Input attributes dict
        @return: Validated attributes dict with added 'days' field
        """
        errors = {}

        week_start = attrs.get("week_start")
        week_end = attrs.get("week_end")
        windows = attrs.get("windows")

        if week_start and week_end and week_end < week_start:
            errors["week_end"] = ["End date must be on or after start date."]

        if windows is not None and len(windows) == 0:
            errors["windows"] = ["At least one scheduling window must be provided."]

        if errors:
            raise serializers.ValidationError(errors)

        attrs["days"] = (week_end - week_start).days + 1
        
        return attrs
    

# Example object

# {
#     "week_start": "2026-03-16",
#     "week_end": "2026-03-21",
#     "even_spread": true,
#     "include_scheduled": false,
#     "windows": [
#         {
#             "start_min": "07:30",
#             "end_min": "23:00",
#             "daily": true
#         }
#     ],
#     "unscheduled": [
#         {
#             "name": "Gym",
#             "duration": "45",
#             "frequency": "3",
#             "daily": false,
#             "start_time_preference": "Late",
#             "location": "Gym",
#             "block_type": "exercise",
#             "description": "Go to gym"
#         },
#         {
#             "name": "Revision",
#             "duration": "120",
#             "frequency": "1",
#             "daily": true,
#             "start_time_preference": "None",
#             "location": "Library",
#             "block_type": "study",
#             "description": "Revision of modules"
#         }
#     ]
# }