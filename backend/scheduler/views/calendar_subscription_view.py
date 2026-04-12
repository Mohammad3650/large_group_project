from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from scheduler.serializers.calendar_subscription_serializer import (
    CalendarSubscriptionSerializer,
)
from scheduler.services.calendar_subscription_mutation_helpers import (
    create_and_sync_subscription,
    delete_subscription_with_imports,
)
from scheduler.services.calendar_subscription_query_helpers import (
    get_user_subscription_or_404,
    list_calendar_subscriptions,
)
from scheduler.services.calendar_subscription_response_helpers import (
    build_message_response,
    build_subscription_response_data,
)
from scheduler.services.calendar_subscription_sync import sync_calendar_subscription
from scheduler.services.calendar_subscription_validation_helpers import (
    validate_unique_subscription,
)


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
        return list_calendar_subscriptions(request.user)

    serializer = CalendarSubscriptionSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    validated_data = serializer.validated_data
    validate_unique_subscription(request.user, validated_data["source_url"])

    subscription, sync_result = create_and_sync_subscription(
        request.user,
        validated_data,
    )
    response_data = build_subscription_response_data(
        subscription,
        sync_result,
        "Calendar subscription imported successfully.",
    )
    return Response(response_data, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def refresh_calendar_subscription(request, subscription_id):
    """
    Refresh a single calendar subscription for the authenticated user.

    Returns:
        Response: The updated subscription details and sync summary.
    """
    subscription = get_user_subscription_or_404(request.user, subscription_id)
    sync_result = sync_calendar_subscription(subscription)

    response_data = build_subscription_response_data(
        subscription,
        sync_result,
        "Calendar subscription refreshed successfully.",
    )
    return Response(response_data, status=status.HTTP_200_OK)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_calendar_subscription(request, subscription_id):
    """
    Delete a saved calendar subscription and its imported time blocks.

    Returns:
        Response: Success message after deletion.
    """
    subscription = get_user_subscription_or_404(request.user, subscription_id)
    delete_subscription_with_imports(subscription, request.user)

    return Response(
        build_message_response("Calendar subscription deleted successfully."),
        status=status.HTTP_200_OK,
    )