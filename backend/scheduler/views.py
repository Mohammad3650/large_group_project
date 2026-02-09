from django.forms import formset_factory
from django.http import HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse

# Create your views here.
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .forms import UserPreferencesFormSet


@api_view(["GET"])
def health(request):
    return Response({"status": "ok"})


def welcome(request):
    return render(request, "welcome.html")


def save_preferences_formset(formset):
    for form in formset:
        if form.cleaned_data:
            form.save()


def create_schedule(request):
    if request.method == "POST":
        preferences_formset = UserPreferencesFormSet(request.POST)
        if preferences_formset.is_valid():
            save_preferences_formset(preferences_formset)
            path = reverse("welcome")
            return HttpResponseRedirect(path)
    else:
        preferences_formset = UserPreferencesFormSet()
    return render(
        request, "create_schedule.html", {"pref_formset": preferences_formset}
    )
