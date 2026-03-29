"""
URL configuration for studysync project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

from scheduler.views.calendar_subscription_view import (
    calendar_subscriptions,
    delete_calendar_subscription,
    refresh_calendar_subscription,
)
from scheduler.views.create_schedule_view import create_schedule
from scheduler.views.generator_view import GenerateScheduleView
from scheduler.views.get_schedule_view import get_schedule
from scheduler.views.edit_schedule_view import edit_time_block
from scheduler.views.delete_schedule_view import delete_schedule
from scheduler.views.get_note_view import get_note
from scheduler.views.save_note_view import save_note
from scheduler.views.save_plan_view import SaveWeeklyPlanView
from scheduler.views.change_password_view import change_password
from scheduler.views.delete_user_view import delete_user
from scheduler.views.export_schedule_view import export_schedule_csv
from scheduler.views.export_ics_view import export_schedule_ics
from scheduler.views.user_registration_view import UserRegistrationView
from scheduler.views.dashboard_view import DashboardView
from scheduler.views.user_details_view import UserDetailsView

urlpatterns = [
    path("admin/", admin.site.urls),
    # path("api/", include("scheduler.api.urls")),
    path("api-auth/", include("rest_framework.urls")),
    path("auth/signup/", UserRegistrationView.as_view(), name="user-signup"),
    path("dashboard/", DashboardView.as_view(), name="dashboard"),
    # JWT auth
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/token/verify/", TokenVerifyView.as_view(), name="token_verify"),
    # path("", TokenVerifyView.as_view(), name="Landing_Page"),
    path("api/time-blocks/", create_schedule, name="api-create-timeblock"),
    path("api/time-blocks/get/", get_schedule, name="api-get-timeblocks"),
    path(
        "api/time-blocks/<int:block_id>/", delete_schedule, name="api-delete-timeblock"
    ),
    path("api/notes/get/", get_note, name="api-get-note"),
    path("api/notes/save/", save_note, name="api-save-note"),
    path("api/timeblocks/<int:id>/edit", edit_time_block, name="api-edit-timeblock"),
    path("api/user/", UserDetailsView.as_view(), name="user-details"),
    path(
        "schedule/generates/", GenerateScheduleView.as_view(), name="schedule-generate"
    ),
    path("api/plans/save/", SaveWeeklyPlanView.as_view(), name="plans-save"),
    path("api/user/change-password/", change_password),
    path("api/user/delete/", delete_user, name="delete_user_view"),
    path(
        "api/time-blocks/export/csv/",
        export_schedule_csv,
        name="api-export-timeblocks-csv",
    ),
    path(
        "api/time-blocks/export/ics/",
        export_schedule_ics,
        name="api-export-timeblocks-ics",
    ),
    path(
        "api/calendar-subscriptions/",
        calendar_subscriptions,
        name="api-calendar-subscriptions",
    ),
    path(
        "api/calendar-subscriptions/<int:subscription_id>/refresh/",
        refresh_calendar_subscription,
        name="api-refresh-calendar-subscription",
    ),
    path(
        "api/calendar-subscriptions/<int:subscription_id>/",
        delete_calendar_subscription,
        name="api-delete-calendar-subscription",
    ),
]
