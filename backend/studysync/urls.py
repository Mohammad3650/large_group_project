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
from scheduler.views.create_schedule_view import create_schedule
from scheduler.views.user_auth import (
    UserRegistrationView,
    UserDetailsView,
    DashboardView,
)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("scheduler.api.urls")),
    path("api-auth/", include("rest_framework.urls")),
    path("auth/signup/", UserRegistrationView.as_view(), name="user-signup"),
    path("dashboard/", DashboardView.as_view(), name="dashboard"),
    # JWT auth
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/token/verify/", TokenVerifyView.as_view(), name="token_verify"),
    # path("", TokenVerifyView.as_view(), name="Landing_Page"),
    path("api/time-blocks/", create_schedule, name="api-create-timeblock"),
]

