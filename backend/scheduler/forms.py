from django import forms
from .models import UserPreferences, DayPlan, TimeBlock
from django.forms import formset_factory

# class UserPreferencesForm(forms.ModelForm):
#     class Meta:
#         model = UserPreferences
#         fields = [
#             "sleep_start",
#             "sleep_end",
#             "study_start",
#             "study_end",
#             "commute_start",
#             "commute_end",
#             "day",
#         ]
#         widgets = {
#             "sleep_start": forms.TimeInput(attrs={"type": "time"}),
#             "sleep_end": forms.TimeInput(attrs={"type": "time"}),
#             "study_start": forms.TimeInput(attrs={"type": "time"}),
#             "study_end": forms.TimeInput(attrs={"type": "time"}),
#             "commute_start": forms.TimeInput(attrs={"type": "time"}),
#             "commute_end": forms.TimeInput(attrs={"type": "time"}),
#         }


class UserPreferencesForm(forms.ModelForm):
    class Meta:
        model = TimeBlock
        fields = ["start_time", "end_time", "block_type"]
        widgets = {
            "start_time": forms.TimeInput(attrs={"type": "time"}),
            "end_time": forms.TimeInput(attrs={"type": "time"}),
            "block_type": forms.Select(
                attrs={"style": "width: auto; max-width: 150px;"}
            ),
        }


UserPreferencesFormSet = formset_factory(UserPreferencesForm)
