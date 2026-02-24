from django.urls import path
from scheduler.api.views import GenerateScheduleView
from scheduler.views.save_plan_view import SaveWeeklyPlanView

urlpatterns = [
    path("schedule/generate/", GenerateScheduleView.as_view(), name="schedule-generate"),
    path("plans/save/", SaveWeeklyPlanView.as_view(), name="plans-save"),
]
