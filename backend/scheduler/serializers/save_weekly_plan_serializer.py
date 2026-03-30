from rest_framework import serializers

from .save_time_block_serializer import SaveTimeBlockSerializer


class SaveWeeklyPlanSerializer(serializers.Serializer):
    """
    Serializer for saving weekly plans with multiple time block events.
    """

    week_start = serializers.DateField(input_formats=["%Y-%m-%d", "%d/%m/%Y"])
    events = SaveTimeBlockSerializer(many=True, allow_empty=False)