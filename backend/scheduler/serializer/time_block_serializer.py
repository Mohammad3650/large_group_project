# from rest_framework import serializers
# from ..models import DayPlan, TimeBlock
#
# class TimeBlockSerializer(serializers.Serializer):
#     date = serializers.DateField()
#     name = serializers.CharField()
#     start_time = serializers.TimeField(required=False)
#     end_time = serializers.TimeField(required=False)
#     duration = serializers.IntegerField(required=False)
#     time_of_day_preference = serializers.CharField(required=False)
#     location = serializers.CharField(allow_blank=True, required=False)
#     block_type = serializers.ChoiceField(choices=TimeBlock.BLOCK_TYPE_CHOICES)
#     description = serializers.CharField(allow_blank=True, required=False)
#     is_fixed = serializers.BooleanField()
#
#     def validate(self, attrs):
#         is_fixed = attrs.get("is_fixed")
#
#         if is_fixed and (
#             not attrs.get("start_time")
#             or not attrs.get("end_time")
#             or attrs.get("start_time") >= attrs.get("end_time")
#         ):
#             raise serializers.ValidationError(
#                 "A start and end time are required in order."
#             )
#         elif not is_fixed and (
#             attrs.get("duration") is None or not attrs.get("time_of_day_preference")
#         ):
#             raise serializers.ValidationError(
#                 "Flexible blocks require duration and time_of_day_preference."
#             )
#
#         return attrs

from rest_framework import serializers
from ..models import DayPlan, TimeBlock


class TimeBlockSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeBlock
        fields = [
            "id",
            "name",
            "location",
            "block_type",
            "description",
            "is_fixed",
            "duration",
            "time_of_day_preference",
            "start_time",
            "end_time",
            # "day",
        ]

    def validate(self, attrs):
        is_fixed = attrs.get("is_fixed")
        errors = {}

        if is_fixed and not attrs.get("start_time"):
            errors["non_field_errors"] = "A start and end time are required in order."
        elif is_fixed and not attrs.get("end_time"):
            errors["non_field_errors"] = "A start and end time are required in order."
        elif is_fixed and attrs.get("start_time") >= attrs.get("end_time"):
            errors["non_field_errors"] = "Start time must be before end time."
        if not is_fixed and attrs.get("duration") is None:
            errors["duration"] = "Flexible blocks require duration."
        if not is_fixed and not attrs.get("time_of_day_preference"):
            errors["time_of_day_preference"] = (
                "Flexible blocks require time of day preference."
            )

        if errors:
            raise serializers.ValidationError(errors)

        return attrs
