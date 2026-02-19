from django.urls import path
from scheduler.api.views import GenerateScheduleView

urlpatterns = [
    path("schedule/generate/", GenerateScheduleView.as_view(), name="schedule-generate"),
]