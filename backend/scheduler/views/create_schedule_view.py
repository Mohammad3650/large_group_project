from django.db import transaction
from django.shortcuts import render, redirect

from ..forms import DayPlanForm, TimeBlockFormSet
from ..models import DayPlan, TimeBlock


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


# will be needed @login_required
@transaction.atomic
def create_schedule(request):
    if request.method == "POST":
        dayplan_form = DayPlanForm(request.POST)
        formset = TimeBlockFormSet(request.POST, queryset=TimeBlock.objects.none())

        if dayplan_form.is_valid() and formset.is_valid():
            user = dayplan_form.cleaned_data["user"]
            date = dayplan_form.cleaned_data["date"]

            dayplan, _ = DayPlan.objects.get_or_create(user=user, date=date)

            TimeBlock.objects.filter(day=dayplan).delete()

            save_preferences_formset(formset, dayplan)
            delete_object_in_formset(formset)

            return redirect("welcome")
    else:
        dayplan_form = DayPlanForm()
        formset = TimeBlockFormSet(queryset=TimeBlock.objects.none())

    return render(
        request,
        "create_schedule.html",
        {"dayplan_form": dayplan_form, "pref_formset": formset},
    )
