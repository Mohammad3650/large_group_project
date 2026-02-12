from django.shortcuts import render, redirect
from django.db import transaction

from rest_framework.decorators import api_view
from rest_framework.response import Response

from .forms import DayPlanForm, TimeBlockFormSet
from .models import DayPlan, TimeBlock

from django.contrib.auth import get_user_model
from .models import User as ProfileUser
from django.contrib.auth.decorators import login_required

def get_profile_user(request) -> ProfileUser:
    """
    TEMP DEV BEHAVIOUR:
    - If someone is logged in, use their profile.
    - Otherwise, use a shared 'dev-user' so the app is usable before login is merged.
    Delete the dev fallback once real login is ready.
    """
    if request.user.is_authenticated:
        profile, _ = ProfileUser.objects.get_or_create(
            auth_user=request.user,
            defaults={
                "first_name": request.user.first_name,
                "last_name": request.user.last_name,
                "email": request.user.email,
            },
        )
        return profile

    # ----- DEV FALLBACK (no login yet) -----
    AuthUser = get_user_model()
    dev_auth_user, _ = AuthUser.objects.get_or_create(
        username="dev-user",
        defaults={"email": "dev@example.com"},
    )

    profile, _ = ProfileUser.objects.get_or_create(
        auth_user=dev_auth_user,
        defaults={
            "first_name": "Dev",
            "last_name": "User",
            "email": "dev@example.com",
        },
    )
    return profile

def schedule_success(request):
    return render(request, "schedule_success.html")

@api_view(["GET"])
def health(request):
    return Response({"status": "ok"})


def welcome(request):
    return render(request, "welcome.html")


def save_preferences_formset(formset, dayplan):
    blocks = formset.save(commit=False)
    for block in blocks:
        block.day = dayplan
        block.save()

def delete_object_in_formset(formset):
    for obj in formset.deleted_objects:
        obj.delete()

@transaction.atomic
def create_schedule(request):
    if request.method == "POST":
        dayplan_form = DayPlanForm(request.POST)
        formset = TimeBlockFormSet(request.POST, queryset=TimeBlock.objects.none())

        if dayplan_form.is_valid() and formset.is_valid():
            date = dayplan_form.cleaned_data["date"]

            profile = get_profile_user(request)

            dayplan, _ = DayPlan.objects.get_or_create(user=profile, date=date)

            TimeBlock.objects.filter(day=dayplan).delete()
            
            save_preferences_formset(formset, dayplan)
            delete_object_in_formset(formset)

            return redirect("schedule_success")
    else:
        dayplan_form = DayPlanForm()
        formset = TimeBlockFormSet(queryset=TimeBlock.objects.none())
    
    return render(
        request,
        "create_schedule.html",
        {"dayplan_form": dayplan_form, "pref_formset": formset},
    )

