from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from ..models import TimeBlock
from scheduler.serializer.time_block_serializer import TimeBlockSerializer


@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def get_schedule(request):
    time_blocks = TimeBlock.objects.filter(day__user=request.user).select_related("day")
    serializer = TimeBlockSerializer(time_blocks, many=True)
    return Response(serializer.data)


@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def edit_timeblock(request, id):

    block = get_object_or_404(TimeBlock, id=id, day__user=request.user)

    if request.method == "GET":
        serializer = TimeBlockSerializer(block)
        data = serializer.data
        data["date"] = str(block.day.date)
        return Response(data)

    elif request.method == "PATCH":
        serializer = TimeBlockSerializer(block, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=400)
