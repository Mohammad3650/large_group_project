from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import serializers, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from scheduler.models import CalendarSubscription, TimeBlock
from scheduler.serializer.calendar_subscription_serializer import (
    CalendarSubscriptionSerializer,
)
from scheduler.services.calendar_subscription_sync import sync_calendar_subscription


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def calendar_subscriptions(request):
    """
    List all calendar subscriptions for the authenticated user or create a new one.

    Returns:
        Response: A list of subscriptions on GET, or the created subscription
        and import summary on POST.
    """
    if request.method == "GET":
        subscriptions = CalendarSubscription.objects.filter(user=request.user).order_by(
            "-created_at"
        )
        serializer = CalendarSubscriptionSerializer(subscriptions, many=True)
        return Response(serializer.data)

    serializer = CalendarSubscriptionSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    source_url = serializer.validated_data["source_url"]

    if CalendarSubscription.objects.filter(user=request.user, source_url=source_url).exists():
        raise serializers.ValidationError(
            {"source_url": ["You have already added this calendar subscription."]}
        )

    subscription = CalendarSubscription.objects.create(
        user=request.user,
        name=serializer.validated_data["name"],
        source_url=source_url,
    )

    sync_result = sync_calendar_subscription(subscription)
    response_serializer = CalendarSubscriptionSerializer(subscription)

    return Response(
        {
            "subscription": response_serializer.data,
            "sync_result": sync_result,
            "message": "Calendar subscription imported successfully.",
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def refresh_calendar_subscription(request, subscription_id):
    """
    Refresh a single calendar subscription for the authenticated user.

    Returns:
        Response: The updated subscription details and sync summary.
    """
    subscription = get_object_or_404(
        CalendarSubscription,
        id=subscription_id,
        user=request.user,
    )

    sync_result = sync_calendar_subscription(subscription)
    serializer = CalendarSubscriptionSerializer(subscription)

    return Response(
        {
            "subscription": serializer.data,
            "sync_result": sync_result,
            "message": "Calendar subscription refreshed successfully.",
        },
        status=status.HTTP_200_OK,
    )


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_calendar_subscription(request, subscription_id):
    """
    Delete a saved calendar subscription and its imported time blocks.

    Returns:
        Response: Success message after deletion.
    """
    subscription = get_object_or_404(
        CalendarSubscription,
        id=subscription_id,
        user=request.user,
    )

    imported_event_qs = subscription.imported_events.select_related("time_block")
    time_block_ids = [event.time_block_id for event in imported_event_qs]

    with transaction.atomic():
        imported_event_qs.delete()
        TimeBlock.objects.filter(
            id__in=time_block_ids,
            day__user=request.user,
        ).delete()
        subscription.delete()

    return Response(
        {"message": "Calendar subscription deleted successfully."},
        status=status.HTTP_200_OK,
    )