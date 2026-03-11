from rest_framework import serializers
from datetime import timedelta


class WindowSerializer(serializers.Serializer):
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

    def validate(self, attrs):
        errors = {}

        start = attrs.get("start_min")
        end = attrs.get("end_min")

        if start is not None and end is not None and start == end:
            errors["end_min"] = ["Sleep cannot be the same as wake up time."]

        if errors:
            raise serializers.ValidationError(errors)

        return attrs


class UnscheduledSerializer(serializers.Serializer):
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
        errors = {}

        frequency = attrs.get("frequency")
        daily = attrs.get("daily")

        if daily and frequency != 1:
            errors["frequency"] = ["Frequency must be 1 when daily=true."]

        if not daily and frequency is None:
            errors["frequency"] = ["Frequency must be provided when daily=false."]

        if errors:
            raise serializers.ValidationError(errors)

        return attrs


class GenerateScheduleRequestSerializer(serializers.Serializer):
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